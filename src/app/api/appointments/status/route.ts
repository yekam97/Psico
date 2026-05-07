import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status, cancellationReason } = await req.json();
    const userRole = (session.user as any).role;
    const companyId = (session.user as any).companyId;

    if (userRole !== "ADMIN" && userRole !== "PSYCHOLOGIST") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const appointment = await (prisma as any).appointment.findFirst({
            where: { id, companyId },
            include: {
                patient: { include: { therapyInventory: true, user: true } }
            }
        });

        if (!appointment) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }

        const updatedAppointment = await prisma.$transaction(async (tx) => {
            // Update the appointment
            const updated = await (tx as any).appointment.update({
                where: { id },
                data: {
                    status: status as AppointmentStatus,
                    cancellationReason: status === "CANCELLED" ? cancellationReason : null
                }
            });

            // Sessions are deducted at booking time (see /api/patient/appointments).
            // On cancellation from SCHEDULED, refund the session so the patient can rebook.
            if (status === "CANCELLED" && appointment.status === "SCHEDULED") {
                const inventory = appointment.patient.therapyInventory;
                if (inventory) {
                    await (tx as any).therapyInventory.update({
                        where: { id: inventory.id },
                        data: {
                            remaining: { increment: 1 }
                        }
                    });

                    await (tx as any).therapyTransaction.create({
                        data: {
                            inventoryId: inventory.id,
                            amount: 1,
                            type: "REFUND",
                            appointmentId: id,
                            notes: cancellationReason
                                ? `Sesión devuelta por cancelación: ${cancellationReason}`
                                : "Sesión devuelta por cancelación"
                        }
                    });
                }
            }

            return updated;
        });

        if (status === "CANCELLED" && appointment.status !== "CANCELLED") {
            try {
                const senderId = (session.user as any).id;
                const receiverId = appointment.patient.user.id;
                const dateStr = format(new Date(appointment.startTime), "EEEE d 'de' MMMM 'a las' h:mm a", { locale: es });
                const reasonText = cancellationReason ? ` Motivo: ${cancellationReason}.` : "";
                const content = `Hola, te informo que tu cita del ${dateStr} ha sido cancelada.${reasonText} Por favor agenda una nueva cuando puedas.`;

                await (prisma as any).message.create({
                    data: {
                        content,
                        senderId,
                        receiverId,
                        companyId: appointment.companyId
                    }
                });
            } catch (notificationError) {
                console.error("Error sending cancellation notification message:", notificationError);
            }
        }

        return NextResponse.json(updatedAppointment);
    } catch (error: any) {
        console.error("Error updating appointment status:", error);
        return NextResponse.json({ error: error.message || "Error updating appointment" }, { status: 500 });
    }
}
