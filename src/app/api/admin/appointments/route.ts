import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    const { patientId, psychologistId, startTime, duration, type, notes } = await req.json();

    if (!patientId || !psychologistId || !startTime) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        const start = new Date(startTime);
        const end = new Date(start.getTime() + (duration || 60) * 60000);

        const appointment = await (prisma as any).appointment.create({
            data: {
                companyId,
                patientId,
                psychologistId,
                startTime: start,
                endTime: end,
                type,
                notes,
                status: "SCHEDULED"
            }
        });

        return NextResponse.json(appointment);
    } catch (error) {
        console.error("Error creating admin appointment:", error);
        return NextResponse.json({ error: "Error creating appointment" }, { status: 500 });
    }
}
