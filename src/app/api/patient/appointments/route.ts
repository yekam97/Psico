import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";
import { createGoogleCalendarEvent } from "@/lib/google-calendar";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { parseClinicDateTime } from "@/lib/timezone";

const TIMEZONE = "America/Bogota";

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
        // Enforce that the patient has therapy inventory before letting them book
        // (mirrors the same check on the admin booking route).
        const inventory = await (prisma as any).therapyInventory.findUnique({
            where: { patientId }
        });

        if (!inventory || inventory.remaining <= 0) {
            return NextResponse.json({ error: "No tienes sesiones disponibles. Contacta a tu centro para recargar tu saldo de terapias." }, { status: 400 });
        }

        const start = parseClinicDateTime(startTime);
        const end = new Date(start.getTime() + (duration || 60) * 60000);

        // Psychologist Overlap Check
        const overlappingPsychologistAppt = await (prisma as any).appointment.findFirst({
            where: {
                psychologistId,
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

        if (overlappingPsychologistAppt) {
            return NextResponse.json({ error: "El psicólogo ya tiene una cita programada en ese horario." }, { status: 400 });
        }

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
            const dateStr = formatInTimeZone(start, TIMEZONE, "EEEE d 'de' MMMM, h:mm a", { locale: es });
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

        // Deduct the therapy session (balance was already confirmed > 0 above)
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

        // Internal notification to psychologist about the new appointment
        // (Patient doesn't need message notification since they just booked)
        try {
            const [patientProfile, psychologistProfile] = await Promise.all([
                (prisma as any).profile.findUnique({
                    where: { id: patientId },
                    include: { user: { select: { id: true, name: true } } }
                }),
                (prisma as any).profile.findUnique({
                    where: { id: psychologistId },
                    include: { user: { select: { id: true, name: true } } }
                })
            ]);

            const isVirtual = type === "VIRTUAL";
            const dateStr = formatInTimeZone(start, TIMEZONE, "EEEE d 'de' MMMM, h:mm a", { locale: es });
            const typeLabel = isVirtual ? "Virtual" : "Presencial";

            let psychologistMessage = `Nueva cita agendada.\n\n📅 Fecha: ${dateStr}\n👤 Paciente: ${patientProfile.user.name}\n📍 Modalidad: ${typeLabel}`;

            if (isVirtual && appointment.meetingLink) {
                psychologistMessage += `\n\n🔗 Link de Google Meet:\n${appointment.meetingLink}`;
            }

            await (prisma as any).message.create({
                data: {
                    companyId,
                    senderId: patientProfile.user.id,
                    receiverId: psychologistProfile.user.id,
                    content: psychologistMessage
                }
            });
        } catch (notificationError) {
            console.error("Error sending appointment notification (non-blocking):", notificationError);
        }

        return NextResponse.json(appointment);
    } catch (error) {
        console.error("Error creating patient appointment:", error);
        return NextResponse.json({ error: "Error al agendar la cita" }, { status: 500 });
    }
}
