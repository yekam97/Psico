import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "PATIENT") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const companyId = (session.user as any).companyId;

    try {
        const user = await (prisma as any).user.findUnique({
            where: { id: userId },
            include: {
                profile: {
                    include: {
                        therapyInventory: true,
                        appointments: {
                            where: { companyId },
                            include: {
                                psychologist: {
                                    include: { user: { select: { name: true } } }
                                }
                            },
                            orderBy: { startTime: "asc" }
                        }
                    }
                }
            }
        });

        if (!user || !user.profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        return NextResponse.json({
            therapyBalance: user.profile.therapyInventory?.remaining || 0,
            appointments: user.profile.appointments
        });
    } catch (error) {
        console.error("Error fetching patient dashboard:", error);
        return NextResponse.json({ error: "Error fetching dashboard data" }, { status: 500 });
    }
}
