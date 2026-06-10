import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";
import { createGoogleCalendarEvent } from "@/lib/google-calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
                    error: `No hay consultorios físicos disponibles para esta hora. (Máximo: ${roomsCount})`
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

        // Google Calendar integration (non-blocking)
        try {
            const [patient, psychologist] = await Promise.all([
                (prisma as any).profile.findUnique({
                    where: { id: patientId },
                    include: { user: { select: { email: true, name: true } } }
                }),
                (prisma as any).profile.findUnique({
                    where: { id: psychologistId },
                    include: { user: { select: { email: true, name: true } } }
                })
            ]);

            const attendeeEmails = [patient.user.email, psychologist.user.email].filter(Boolean);
            const isVirtual = type === "VIRTUAL";
            const dateStr = format(start, "EEEE d 'de' MMMM, h:mm a", { locale: es });
            const typeLabel = isVirtual ? "Virtual (Google Meet)" : "Presencial";

            const { eventId, meetingLink } = await createGoogleCalendarEvent({
                title: `Sesión: ${patient.user.name} - ${psychologist.user.name}`,
                description: `Cita ${typeLabel}\nPaciente: ${patient.user.name}\nPsicólogo: ${psychologist.user.name}\nFecha: ${dateStr}${notes ? `\nNotas: ${notes}` : ""}`,
                startTime: start,
                endTime: end,
                attendeeEmails,
                isVirtual
            });

            if (eventId) {
                await (prisma as any).appointment.update({
                    where: { id: appointment.id },
                    data: { googleEventId: eventId, meetingLink }
                });
                appointment.googleEventId = eventId;
                appointment.meetingLink = meetingLink;
            }
        } catch (calendarError) {
            console.error("Google Calendar integration error (non-blocking):", calendarError);
        }

        return NextResponse.json(appointment);
    } catch (error) {
        console.error("Error creating admin appointment:", error);
        return NextResponse.json({ error: "Error creating appointment" }, { status: 500 });
    }
}
