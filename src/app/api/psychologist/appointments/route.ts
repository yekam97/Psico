import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "PSYCHOLOGIST") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const psychologistId = (session.user as any).profileId;
    const companyId = (session.user as any).companyId;

    if (!psychologistId) {
        console.error("No profileId found for psychologist session:", session.user);
        return NextResponse.json({ daily: [], upcoming: [] }); // Return empty instead of 500
    }

    try {
        // Get today's appointments
        const today = new Date();
        const start = startOfDay(today);
        const end = endOfDay(today);

        const dailyAppointments = await (prisma as any).appointment.findMany({
            where: {
                psychologistId,
                companyId,
                startTime: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                patient: {
                    include: {
                        user: { select: { name: true, email: true } },
                        therapyInventory: true
                    }
                }
            },
            orderBy: { startTime: "asc" }
        });

        // Get all upcoming (next 30 days)
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);

        const upcomingAppointments = await (prisma as any).appointment.findMany({
            where: {
                psychologistId,
                companyId,
                startTime: {
                    gt: end,
                    lte: thirtyDaysLater
                }
            },
            include: {
                patient: {
                    include: {
                        user: { select: { name: true, email: true } }
                    }
                }
            },
            orderBy: { startTime: "asc" }
        });

        return NextResponse.json({
            daily: dailyAppointments,
            upcoming: upcomingAppointments
        });
    } catch (error) {
        console.error("Error fetching psychologist appointments:", error);
        return NextResponse.json({ error: "Error fetching appointments" }, { status: 500 });
    }
}
