import { google } from "googleapis";

/**
 * Google Calendar API utility for generating Meet links.
 * Requires: GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID
 */
export async function createGoogleMeetEvent(details: {
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    attendeeEmail: string;
}) {
    const auth = new google.auth.JWT(
        process.env.GOOGLE_CLIENT_EMAIL,
        undefined,
        process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        ["https://www.googleapis.com/auth/calendar"]
    );

    const calendar = google.calendar({ version: "v3", auth });

    const event = {
        summary: details.title,
        description: details.description,
        start: {
            dateTime: details.startTime.toISOString(),
            timeZone: "America/Bogota",
        },
        end: {
            dateTime: details.endTime.toISOString(),
            timeZone: "America/Bogota",
        },
        attendees: [{ email: details.attendeeEmail }],
        conferenceData: {
            createRequest: {
                requestId: `meet-${Date.now()}`,
                conferenceSolutionKey: { type: "hangoutsMeet" },
            },
        },
    };

    try {
        const response = await calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
            requestBody: event,
            conferenceDataVersion: 1,
        });

        return {
            eventId: response.data.id,
            hangoutLink: response.data.hangoutLink,
        };
    } catch (error) {
        console.error("Error creating Google Meet event:", error);
        throw error;
    }
}
