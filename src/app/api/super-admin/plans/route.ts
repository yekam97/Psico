import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const plans = await prisma.plan.findMany({
            include: { _count: { select: { companies: true } } },
            orderBy: { createdAt: "asc" }
        });
        return NextResponse.json(plans);
    } catch (error) {
        console.error("Error fetching plans:", error);
        return NextResponse.json({ error: "Error al cargar planes" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, maxPatients, maxProfessionals, modules } = await req.json();

    if (!name) {
        return NextResponse.json({ error: "El nombre del plan es requerido" }, { status: 400 });
    }

    try {
        const plan = await prisma.plan.create({
            data: {
                name,
                maxPatients: maxPatients === "" || maxPatients === null ? null : Number(maxPatients),
                maxProfessionals: maxProfessionals === "" || maxProfessionals === null ? null : Number(maxProfessionals),
                modules: Array.isArray(modules) ? modules : []
            }
        });
        return NextResponse.json(plan);
    } catch (error: any) {
        console.error("Error creating plan:", error);
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Ya existe un plan con ese nombre" }, { status: 400 });
        }
        return NextResponse.json({ error: "Error al crear el plan" }, { status: 500 });
    }
}
