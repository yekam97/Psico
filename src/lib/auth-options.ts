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
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                            companyId: user.companyId,
                            profileId: user.profile?.id
                        };
                    }
                } catch (e) {
                    console.error("Auth error:", e);
                }

                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.companyId = (user as any).companyId;
                token.profileId = (user as any).profileId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).companyId = token.companyId;
                (session.user as any).profileId = token.profileId;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};
