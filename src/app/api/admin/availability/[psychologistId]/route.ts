import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";
import { clinicDayBounds, dayOfWeekForDateString, formatClinicTime, parseClinicDateTime } from "@/lib/timezone";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ psychologistId: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { psychologistId } = await params;
    const companyId = (session.user as any).companyId;

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
        return NextResponse.json({ error: "Date parameter required" }, { status: 400 });
    }

    try {
        const dayOfWeek = dayOfWeekForDateString(dateParam);

        const availabilities = await prisma.availability.findMany({
            where: {
                psychologistId,
                companyId,
                dayOfWeek,
                isActive: true
            }
        });

        if (availabilities.length === 0) {
            return NextResponse.json({ slots: [], message: "No hay disponibilidad para este día" });
        }

        const { start: startOfDay, end: endOfDay } = clinicDayBounds(dateParam);

        const existingAppointments = await prisma.appointment.findMany({
            where: {
                psychologistId,
                startTime: { gte: startOfDay, lte: endOfDay },
                status: { in: ["SCHEDULED", "COMPLETED"] }
            },
            select: { startTime: true, endTime: true }
        });

        const bookedSlots = new Set(
            existingAppointments.map(apt => formatClinicTime(apt.startTime))
        );

        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

        const slots: string[] = [];

        for (const availability of availabilities) {
            const [startHour, startMin] = availability.startTime.split(":").map(Number);
            const [endHour, endMin] = availability.endTime.split(":").map(Number);

            let currentHour = startHour;
            let currentMin = startMin;

            while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
                const slotTime = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;

                const slotDateTime = parseClinicDateTime(`${dateParam}T${slotTime}:00`);

                const isNotBooked = !bookedSlots.has(slotTime);
                const isInFuture = slotDateTime > oneHourFromNow;

                if (isNotBooked && isInFuture) {
                    slots.push(slotTime);
                }

                currentHour += 1;
            }
        }

        slots.sort();

        return NextResponse.json({ slots });
    } catch (error) {
        console.error("Error fetching availability:", error);
        return NextResponse.json({ error: "Error fetching availability" }, { status: 500 });
    }
}
