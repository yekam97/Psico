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
    const { specialty, planId } = await req.json();

    try {
        const company = await prisma.company.update({
            where: { id },
            data: {
                ...(specialty ? { specialty } : {}),
                planId: planId === undefined ? undefined : (planId || null)
            }
        });

        return NextResponse.json(company);
    } catch (error) {
        console.error("Error updating company:", error);
        return NextResponse.json({ error: "Error al actualizar el centro" }, { status: 500 });
    }
}
