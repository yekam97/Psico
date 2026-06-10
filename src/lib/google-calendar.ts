import { google } from "googleapis";

function getCalendarAuth() {
    return new google.auth.JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/calendar"],
    });
}

export async function createGoogleCalendarEvent(details: {
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    attendeeEmails: string[];
    isVirtual: boolean;
}): Promise<{ eventId: string | null; meetingLink: string | null }> {
    const auth = getCalendarAuth();
    const calendar = google.calendar({ version: "v3", auth });

    const event: any = {
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
        attendees: details.attendeeEmails.map(email => ({ email })),
    };

    if (details.isVirtual) {
        event.conferenceData = {
            createRequest: {
                requestId: `meet-${Date.now()}`,
                conferenceSolutionKey: { type: "hangoutsMeet" },
            },
        };
    }

    try {
        const response = await calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
            requestBody: event,
            conferenceDataVersion: details.isVirtual ? 1 : 0,
        });

        return {
            eventId: response.data.id || null,
            meetingLink: response.data.hangoutLink || null,
        };
    } catch (error) {
        console.error("Error creating Google Calendar event:", error);
        return { eventId: null, meetingLink: null };
    }
}

export async function deleteGoogleCalendarEvent(eventId: string): Promise<boolean> {
    const auth = getCalendarAuth();
    const calendar = google.calendar({ version: "v3", auth });

    try {
        await calendar.events.delete({
            calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
            eventId,
        });
        return true;
    } catch (error) {
        console.error("Error deleting Google Calendar event:", error);
        return false;
    }
}
