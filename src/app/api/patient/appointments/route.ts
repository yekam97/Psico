import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "PATIENT") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patientId = (session.user as any).profileId;
    const companyId = (session.user as any).companyId;
    const { psychologistId, startTime, duration, type, notes } = await req.json();

    if (!psychologistId || !startTime) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        const start = new Date(startTime);
        const end = new Date(start.getTime() + (duration || 60) * 60000);

        // Room Availability Check for IN_PERSON appointments
        if (type === "IN_PERSON") {
            const company = await (prisma.company as any).findUnique({
                where: { id: companyId },
                select: { physicalRooms: true }
            });

            const roomsCount = (company as any)?.physicalRooms || 1;

            const concurrentAppointments = await (prisma as any).appointment.count({
                where: {
                    companyId,
                    type: "IN_PERSON",
                    status: "SCHEDULED",
                    OR: [
                        {
                            startTime: { lte: start },
                            endTime: { gt: start }
                        },
                        {
                            startTime: { lt: end },
                            endTime: { gte: end }
                        }
                    ]
                }
            });

            if (concurrentAppointments >= roomsCount) {
                return NextResponse.json({
                    error: `Lo sentimos, no hay consultorios físicos disponibles para esta hora.`
                }, { status: 400 });
            }
        }

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

        // Deduct therapy session if applicable (Assuming it costs 1 session)
        const inventory = await (prisma as any).therapyInventory.findUnique({
            where: { patientId }
        });

        if (inventory && inventory.remaining > 0) {
            await (prisma as any).therapyInventory.update({
                where: { patientId },
                data: {
                    remaining: { decrement: 1 },
                    history: {
                        create: {
                            amount: -1,
                            type: "SESSION_COMPLETED",
                            appointmentId: appointment.id,
                            notes: "Cita agendada"
                        }
                    }
                }
            });
        } else {
            // If they don't have sessions, maybe we shouldn't allow booking?
            // For now, we allow it but log it.
            console.warn(`Patient ${patientId} booked without available therapy sessions.`);
        }

        return NextResponse.json(appointment);
    } catch (error) {
        console.error("Error creating patient appointment:", error);
        return NextResponse.json({ error: "Error al agendar la cita" }, { status: 500 });
    }
}
