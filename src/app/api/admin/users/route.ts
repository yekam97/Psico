import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

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
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User and Profile in a transaction
        const newUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role: role as Role,
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
