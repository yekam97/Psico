import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ patientId: string }> }
) {
    const session = await getServerSession(authOptions);
    const { patientId } = await context.params;

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;

    try {
        const history = await (prisma as any).therapyTransaction.findMany({
            where: {
                inventory: {
                    patientId: patientId,
                    patient: {
                        user: { companyId }
                    }
                }
            },
            include: {
                inventory: true
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 20
        });

        return NextResponse.json(history);
    } catch (error) {
        console.error("Error fetching therapy history:", error);
        return NextResponse.json({ error: "Error fetching history" }, { status: 500 });
    }
}
