import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

const DAY_MAP: Record<string, number> = {
    "Lunes": 1,
    "Martes": 2,
    "Miércoles": 3,
    "Jueves": 4,
    "Viernes": 5,
    "Sábado": 6,
    "Domingo": 0
};

const REVERSE_DAY_MAP: Record<number, string> = {
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
    0: "Domingo"
};

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "PSYCHOLOGIST") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profileId = (session.user as any).profileId;
    const companyId = (session.user as any).companyId;

    try {
        const availabilities = await prisma.availability.findMany({
            where: {
                psychologistId: profileId,
                companyId
            }
        });

        const schedule: Record<string, { active: boolean; start: string; end: string }> = {
            "Lunes": { active: false, start: "08:00", end: "17:00" },
            "Martes": { active: false, start: "08:00", end: "17:00" },
            "Miércoles": { active: false, start: "08:00", end: "17:00" },
            "Jueves": { active: false, start: "08:00", end: "17:00" },
            "Viernes": { active: false, start: "08:00", end: "17:00" },
            "Sábado": { active: false, start: "09:00", end: "12:00" },
        };

        for (const avail of availabilities) {
            const dayName = REVERSE_DAY_MAP[avail.dayOfWeek];
            if (dayName && schedule[dayName] !== undefined) {
                schedule[dayName] = {
                    active: avail.isActive,
                    start: avail.startTime,
                    end: avail.endTime
                };
            }
        }

        return NextResponse.json({ schedule });
    } catch (error) {
        console.error("Error fetching availability:", error);
        return NextResponse.json({ error: "Error fetching availability" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "PSYCHOLOGIST") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profileId = (session.user as any).profileId;
    const companyId = (session.user as any).companyId;

    try {
        const { schedule } = await request.json();

        await prisma.availability.deleteMany({
            where: {
                psychologistId: profileId,
                companyId
            }
        });

        const createPromises = [];
        for (const [dayName, config] of Object.entries(schedule)) {
            const dayOfWeek = DAY_MAP[dayName];
            if (dayOfWeek === undefined) continue;

            const { active, start, end } = config as { active: boolean; start: string; end: string };

            createPromises.push(
                prisma.availability.create({
                    data: {
                        psychologistId: profileId,
                        companyId,
                        dayOfWeek,
                        startTime: start,
                        endTime: end,
                        isActive: active
                    }
                })
            );
        }

        await Promise.all(createPromises);

        return NextResponse.json({ success: true, message: "Disponibilidad actualizada" });
    } catch (error) {
        console.error("Error saving availability:", error);
        return NextResponse.json({ error: "Error saving availability" }, { status: 500 });
    }
}
