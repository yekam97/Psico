import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;

    try {
        const therapyBalances = await prisma.therapyInventory.findMany({
            where: { patient: { user: { companyId } } },
            include: {
                patient: { include: { user: { select: { name: true, email: true } } } }
            }
        });

        return NextResponse.json(therapyBalances);
    } catch (error) {
        console.error("Error fetching therapy balances:", error);
        return NextResponse.json({ error: "Error fetching therapy balances" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { patientId, amount, notes } = await req.json();

    try {
        const result = await prisma.$transaction(async (tx) => {
            const inventory = await (tx as any).therapyInventory.upsert({
                where: { patientId },
                update: {
                    totalAssigned: { increment: amount },
                    remaining: { increment: amount }
                },
                create: {
                    patientId,
                    totalAssigned: amount,
                    remaining: amount
                }
            });

            await (tx as any).therapyTransaction.create({
                data: {
                    inventoryId: inventory.id,
                    amount,
                    type: "PURCHASE",
                    notes: notes || "Recarga administrativa"
                }
            });

            return inventory;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error updating therapy balance:", error);
        return NextResponse.json({ error: "Error updating therapy balance" }, { status: 500 });
    }
}
