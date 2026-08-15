import { fromZonedTime, formatInTimeZone } from "date-fns-tz";

/**
 * Single timezone for the whole platform (all tenants operate in Colombia today).
 * Every appointment date/time that crosses the client/server boundary as a naive
 * "YYYY-MM-DDTHH:mm[:ss]" string (no offset) must be interpreted as wall-clock
 * time in this zone, regardless of where the Node process itself is running
 * (local dev machines default to the OS timezone, Vercel serverless functions
 * default to UTC — without this, the same naive string produces two different
 * instants depending on where the code executes).
 */
export const CLINIC_TIMEZONE = "America/Bogota";

/**
 * Parses a naive local datetime string (e.g. "2026-08-15T09:00:00", as produced
 * by `${date}T${time}:00`) as wall-clock time in CLINIC_TIMEZONE and returns the
 * corresponding UTC instant. Use this instead of `new Date(naiveString)` for any
 * appointment start/end time coming from a client.
 */
export function parseClinicDateTime(naiveDateTime: string): Date {
    return fromZonedTime(naiveDateTime, CLINIC_TIMEZONE);
}

/**
 * Formats a Date as "HH:mm" in CLINIC_TIMEZONE. Use this instead of
 * `date.toISOString().slice(11, 16)`, which returns the UTC time and silently
 * drifts from the clinic's local slot labels whenever the server isn't UTC+0
 * relative to Bogota by coincidence.
 */
export function formatClinicTime(date: Date): string {
    return formatInTimeZone(date, CLINIC_TIMEZONE, "HH:mm");
}

/**
 * Returns the day-of-week (0 = Sunday .. 6 = Saturday) for a plain "YYYY-MM-DD"
 * calendar date, independent of the server's local timezone. Anchoring at noon
 * avoids crossing a day boundary for any real-world UTC offset (-12..+14) when
 * the Date object is later read back with local (server-timezone) getters.
 */
export function dayOfWeekForDateString(dateOnly: string): number {
    return new Date(`${dateOnly}T12:00:00`).getDay();
}

/**
 * Returns the [start, end) UTC instants covering an entire calendar day in
 * CLINIC_TIMEZONE, for querying appointments that fall "on" that date.
 */
export function clinicDayBounds(dateOnly: string): { start: Date; end: Date } {
    return {
        start: fromZonedTime(`${dateOnly}T00:00:00`, CLINIC_TIMEZONE),
        end: fromZonedTime(`${dateOnly}T23:59:59.999`, CLINIC_TIMEZONE)
    };
}
