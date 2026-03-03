import { differenceInHours } from "date-fns";

/**
 * Business Rule: Can only cancel if more than 12 hours before start.
 */
export function canCancelAppointment(startTime: Date): boolean {
    const now = new Date();
    const hoursUntilStart = differenceInHours(startTime, now);

    return hoursUntilStart >= 12;
}

/**
 * Calculates if an appointment is upcoming, completed, etc.
 */
export function getAppointmentStatusLabel(startTime: Date, status: string): string {
    if (status === "CANCELLED") return "Cancelada";
    const now = new Date();
    if (startTime < now) return "Completada/Pasada";
    return "Programada";
}
