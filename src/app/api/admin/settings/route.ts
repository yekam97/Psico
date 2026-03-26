import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    if (!companyId) {
        console.error("Admin settings requested but no companyId in session.");
        return NextResponse.json({ error: "No company associated with this account" }, { status: 400 });
    }

    try {
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: {
                name: true,
                logoUrl: true,
                primaryColor: true,
                secondaryColor: true,
                tertiaryColor: true,
                businessHours: true,
                physicalRooms: true
            }
        });

        if (!company) {
            console.error(`Company not found in database: ${companyId}`);
            return NextResponse.json({ error: "Centro no encontrado en la base de datos" }, { status: 404 });
        }

        return NextResponse.json(company);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ error: "Error interno al consultar configuración", message: (error as any).message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    if (!companyId) {
        return NextResponse.json({ error: "No companyId found" }, { status: 400 });
    }

    const { logoUrl, primaryColor, secondaryColor, tertiaryColor, businessHours, physicalRooms } = await req.json();

    try {
        const updatedCompany = await prisma.company.upsert({
            where: { id: companyId },
            update: {
                logoUrl,
                primaryColor,
                secondaryColor,
                tertiaryColor,
                businessHours,
                physicalRooms: physicalRooms ? parseInt(physicalRooms) : undefined
            },
            create: {
                id: companyId,
                name: "Mi Centro",
                domain: companyId,
                logoUrl,
                primaryColor,
                secondaryColor,
                tertiaryColor,
                businessHours,
                physicalRooms: physicalRooms ? parseInt(physicalRooms) : 1
            }
        });

        return NextResponse.json(updatedCompany);
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ error: "Error al actualizar configuración", message: (error as any).message }, { status: 500 });
    }
}
