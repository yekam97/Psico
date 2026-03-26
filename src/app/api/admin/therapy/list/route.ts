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
        const patients = await (prisma as any).user.findMany({
            where: {
                companyId,
                role: "PATIENT"
            },
            include: {
                profile: {
                    include: {
                        therapyInventory: true,
                        appointments: {
                            where: {
                                status: "SCHEDULED"
                            },
                        }
                    }
                }
            },
            orderBy: { name: "asc" }
        }) as any[];

        const therapyList = patients.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.profile?.phone,
            inventory: user.profile?.therapyInventory ? {
                totalAssigned: user.profile.therapyInventory.totalAssigned,
                remaining: user.profile.therapyInventory.remaining,
            } : null,
            reservedCount: user.profile?.appointments?.length || 0
        }));

        return NextResponse.json(therapyList);
    } catch (error) {
        console.error("Error fetching therapy list:", error);
        return NextResponse.json({ error: "Error fetching therapy list" }, { status: 500 });
    }
}
