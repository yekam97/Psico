import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";
import { compare } from "bcryptjs"; // Need to install bcryptjs

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            name: "Sign in",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email },
                        include: { profile: true }
                    });

                    if (user && await compare(credentials.password, user.password)) {
                        if (!(user as any).portalAccess) {
                            // Distinguish this from a generic bad-credentials error so
                            // the login page can explain *why* (plan doesn't include
                            // portal access for this account) instead of implying a
                            // typo'd password.
                            throw new Error("NO_PORTAL_ACCESS");
                        }
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                            companyId: user.companyId,
                            profileId: user.profile?.id,
                            avatarUrl: (user as any).avatarUrl
                        };
                    }
                } catch (e) {
                    if (e instanceof Error && e.message === "NO_PORTAL_ACCESS") {
                        throw e;
                    }
                    console.error("Auth error:", e);
                }

                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.companyId = (user as any).companyId;
                token.profileId = (user as any).profileId;
                token.avatarUrl = (user as any).avatarUrl;
            }
            // Allow the client to push updates (e.g. after saving the profile
            // page) via useSession().update({ name, avatarUrl }) without a
            // full re-login.
            if (trigger === "update" && session) {
                if (typeof session.name === "string") token.name = session.name;
                if (typeof session.avatarUrl === "string") token.avatarUrl = session.avatarUrl;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).companyId = token.companyId;
                (session.user as any).profileId = token.profileId;
                (session.user as any).avatarUrl = token.avatarUrl;
                if (token.name) session.user.name = token.name as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};
