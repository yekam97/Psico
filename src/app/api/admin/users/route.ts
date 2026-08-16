import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { hasModule, PLAN_MODULES } from "@/lib/specialty";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;

    try {
        const users = await prisma.user.findMany({
            where: { companyId },
            include: {
                profile: {
                    include: {
                        assignedPsychologists: {
                            include: {
                                psychologist: {
                                    include: {
                                        user: {
                                            select: { name: true }
                                        }
                                    }
                                }
                            }
                        },
                        therapyInventory: true
                    }
                }
            } as any,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Error fetching users" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    const { email, password, name, role, psychologistIds, phone } = await req.json();

    try {
        let portalAccess = true;

        if (role === "PATIENT" || role === "PSYCHOLOGIST") {
            const company = await prisma.company.findUnique({
                where: { id: companyId },
                select: { plan: { select: { maxPatients: true, maxProfessionals: true, modules: true } } }
            });

            const limit = role === "PATIENT" ? company?.plan?.maxPatients : company?.plan?.maxProfessionals;
            if (typeof limit === "number") {
                const currentCount = await prisma.user.count({ where: { companyId, role: role as Role } });
                if (currentCount >= limit) {
                    const noun = role === "PATIENT" ? "pacientes" : "profesionales";
                    return NextResponse.json({
                        error: `Tu plan permite un máximo de ${limit} ${noun}. Actualiza tu plan para agregar más.`
                    }, { status: 400 });
                }
            }

            // Plans without PORTAL_ACCESS create the record (for note-taking/
            // organization) but it can never log in — see User.portalAccess
            // and src/lib/auth-options.ts. The password is meaningless in
            // that case, so a random one replaces whatever was submitted
            // instead of requiring the admin to invent one for an account
            // that will never use it.
            portalAccess = hasModule(company?.plan?.modules ?? null, PLAN_MODULES.PORTAL_ACCESS);
        }

        const effectivePassword = portalAccess ? password : crypto.randomBytes(24).toString("hex");
        if (portalAccess && !password) {
            return NextResponse.json({ error: "La contraseña es requerida" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(effectivePassword, 10);

        // Create User and Profile in a transaction
        const newUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role: role as Role,
                    portalAccess,
                    companyId,
                    profile: {
                        create: {
                            phone,
                            // Initialize therapy inventory if patient
                            ...(role === "PATIENT" ? {
                                therapyInventory: {
                                    create: {
                                        totalAssigned: 0,
                                        remaining: 0
                                    }
                                }
                            } : {})
                        }
                    }
                },
                include: { profile: true }
            });

            // Handle Psychologist assignments if role is PATIENT
            if (role === "PATIENT" && psychologistIds && psychologistIds.length > 0) {
                const assignments = psychologistIds.slice(0, 2).map((pid: string) => ({
                    patientId: user.profile!.id,
                    psychologistId: pid
                }));

                await (tx as any).patientPsychologist.createMany({
                    data: assignments
                });
            }

            return user;
        });

        return NextResponse.json(newUser);
    } catch (error: any) {
        console.error("Error creating user:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Error creating user" }, { status: 500 });
    }
}
