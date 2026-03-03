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
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                // Demo Accounts for immediate testing (Mock Company ID)
                const minervaId = "minerva-default-id";
                const demoUsers = [
                    { id: "1", email: "admin@minerva.com", password: "123", name: "Admin Minerva", role: "ADMIN", companyId: minervaId },
                    { id: "2", email: "psicologo@minerva.com", password: "123", name: "Dr. Roberto Casas", role: "PSYCHOLOGIST", companyId: minervaId },
                    { id: "3", email: "paciente@minerva.com", password: "123", name: "Ana Maria", role: "PATIENT", companyId: minervaId },
                ];

                const demoUser = demoUsers.find(u => u.email === credentials.email && u.password === credentials.password);
                if (demoUser) return demoUser;

                // Try Prisma if demo fails
                try {
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email },
                    });

                    if (user && user.password === credentials.password) {
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                            companyId: user.companyId,
                        };
                    }
                } catch (e) {
                    console.error("Prisma connection error:", e);
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
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).companyId = token.companyId;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};
