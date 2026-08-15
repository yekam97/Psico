/**
 * Formats a Date as a "YYYY-MM-DD" string using its *local* calendar date
 * (matching what an <input type="date"> shows/expects). Use this instead of
 * `date.toISOString().split('T')[0]`, which reads the UTC calendar date —
 * during Bogota evenings (UTC-5, roughly 7pm–midnight local) that rolls over
 * to tomorrow's date several hours early, silently blocking same-day booking.
 */
export function toLocalDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
