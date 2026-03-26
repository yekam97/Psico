import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";
import {
    startOfWeek,
    endOfWeek,
} from "date-fns";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    try {
        const weeklyAppointments = await prisma.appointment.findMany({
            where: { companyId, startTime: { gte: weekStart, lte: weekEnd } },
            include: {
                patient: { include: { user: { select: { name: true } } } },
                psychologist: { include: { user: { select: { name: true } } } }
            }
        });

        const virtual = weeklyAppointments.filter(a => a.type === "VIRTUAL").length;
        const inPerson = weeklyAppointments.filter(a => a.type === "IN_PERSON").length;
        const cancelled = weeklyAppointments.filter(a => a.status === "CANCELLED");

        const cancellationDetails = cancelled.map((a: any) => ({
            id: a.id,
            patient: a.patient.user.name,
            psychologist: a.psychologist.user.name,
            date: a.startTime,
            reason: a.cancellationReason || "No especificada"
        }));

        return NextResponse.json({
            virtual,
            inPerson,
            totalCancelled: cancelled.length,
            cancellationDetails
        });
    } catch (error) {
        console.error("Error fetching reports:", error);
        return NextResponse.json({ error: "Error fetching reports" }, { status: 500 });
    }
}
