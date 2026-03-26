import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "PSYCHOLOGIST") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const psychologistId = (session.user as any).profileId;
    const companyId = (session.user as any).companyId;

    try {
        const assignments = await (prisma as any).patientPsychologist.findMany({
            where: { psychologistId },
            include: {
                patient: {
                    include: {
                        user: { select: { name: true, email: true, id: true } },
                        therapyInventory: true,
                        appointments: {
                            where: { companyId },
                            orderBy: { startTime: "desc" },
                            take: 1
                        }
                    }
                }
            }
        });

        const patients = assignments.map((a: any) => ({
            id: a.patient.id,
            userId: a.patient.user.id,
            name: a.patient.user.name,
            email: a.patient.user.email,
            phone: a.patient.phone,
            therapyBalance: a.patient.therapyInventory?.remaining || 0,
            lastAppointment: a.patient.appointments[0] || null
        }));

        return NextResponse.json(patients);
    } catch (error) {
        console.error("Error fetching psychologist patients:", error);
        return NextResponse.json({ error: "Error fetching patients" }, { status: 500 });
    }
}
