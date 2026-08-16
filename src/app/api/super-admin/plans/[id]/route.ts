import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { name, maxPatients, maxProfessionals, modules } = await req.json();

    try {
        const plan = await prisma.plan.update({
            where: { id },
            data: {
                ...(name ? { name } : {}),
                maxPatients: maxPatients === "" || maxPatients === null ? null : Number(maxPatients),
                maxProfessionals: maxProfessionals === "" || maxProfessionals === null ? null : Number(maxProfessionals),
                modules: Array.isArray(modules) ? modules : undefined
            }
        });
        return NextResponse.json(plan);
    } catch (error) {
        console.error("Error updating plan:", error);
        return NextResponse.json({ error: "Error al actualizar el plan" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const inUse = await prisma.company.count({ where: { planId: id } });
        if (inUse > 0) {
            return NextResponse.json({ error: `No se puede eliminar: ${inUse} centro(s) usan este plan.` }, { status: 400 });
        }
        await prisma.plan.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting plan:", error);
        return NextResponse.json({ error: "Error al eliminar el plan" }, { status: 500 });
    }
}
