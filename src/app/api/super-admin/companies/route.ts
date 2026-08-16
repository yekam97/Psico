import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

function requireSuperAdmin(session: any) {
    return session && session.user?.role === "SUPER_ADMIN";
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!requireSuperAdmin(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const companies = await prisma.company.findMany({
            include: {
                plan: true,
                _count: { select: { users: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        // Break down user counts by role per company (admins/professionals/patients)
        const results = await Promise.all(
            companies.map(async (company) => {
                const [admins, professionals, patients] = await Promise.all([
                    prisma.user.count({ where: { companyId: company.id, role: "ADMIN" } }),
                    prisma.user.count({ where: { companyId: company.id, role: "PSYCHOLOGIST" } }),
                    prisma.user.count({ where: { companyId: company.id, role: "PATIENT" } }),
                ]);
                return { ...company, counts: { admins, professionals, patients } };
            })
        );

        return NextResponse.json(results);
    } catch (error) {
        console.error("Error fetching companies:", error);
        return NextResponse.json({ error: "Error al cargar centros" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!requireSuperAdmin(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyName, domain, specialty, planId, adminEmail, adminPassword, adminName } = await req.json();

    if (!companyName || !domain || !specialty || !adminEmail || !adminPassword || !adminName) {
        return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    try {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const company = await prisma.$transaction(async (tx) => {
            const newCompany = await tx.company.create({
                data: {
                    name: companyName,
                    domain,
                    specialty,
                    planId: planId || null
                }
            });

            await tx.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    name: adminName,
                    role: Role.ADMIN,
                    companyId: newCompany.id,
                    profile: { create: {} }
                }
            });

            return newCompany;
        });

        return NextResponse.json(company);
    } catch (error: any) {
        console.error("Error creating company:", error);
        if (error.code === "P2002") {
            return NextResponse.json({ error: "El dominio o el correo del admin ya están en uso" }, { status: 400 });
        }
        return NextResponse.json({ error: "Error al crear el centro" }, { status: 500 });
    }
}
