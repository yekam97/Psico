import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

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
                patient: { include: { therapyInventory: true } }
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

            // If marked as COMPLETED and was not completed before, deduct therapy
            if (status === "COMPLETED" && appointment.status !== "COMPLETED") {
                const inventory = appointment.patient.therapyInventory;
                if (!inventory || inventory.remaining <= 0) {
                    throw new Error("Patient has no available therapy sessions");
                }

                await (tx as any).therapyInventory.update({
                    where: { id: inventory.id },
                    data: {
                        remaining: { decrement: 1 }
                    }
                });

                await (tx as any).therapyTransaction.create({
                    data: {
                        inventoryId: inventory.id,
                        amount: -1,
                        type: "SESSION_COMPLETED",
                        appointmentId: id,
                        notes: "Sesión completada y descontada"
                    }
                });
            }

            return updated;
        });

        return NextResponse.json(updatedAppointment);
    } catch (error: any) {
        console.error("Error updating appointment status:", error);
        return NextResponse.json({ error: error.message || "Error updating appointment" }, { status: 500 });
    }
}
