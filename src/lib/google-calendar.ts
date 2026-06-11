import { google } from "googleapis";

function getCalendarAuth() {
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || "";

    // Handle different escape formats from environment variables
    // Vercel may store as literal \n or as escaped \\n
    if (privateKey.includes("\\n")) {
        privateKey = privateKey.replace(/\\n/g, "\n");
    }

    return new google.auth.JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/calendar"],
        // Domain-Wide Delegation: impersonate a real user to send invitations
        subject: process.env.GOOGLE_IMPERSONATE_EMAIL || undefined,
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

    const canSendInvites = !!process.env.GOOGLE_IMPERSONATE_EMAIL;

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
    };

    // Only add attendees if Domain-Wide Delegation is configured
    if (canSendInvites && details.attendeeEmails.length > 0) {
        event.attendees = details.attendeeEmails.map(email => ({ email }));
    }

    // Google Meet requires Domain-Wide Delegation (impersonating a real user)
    // Service accounts alone cannot create Meet conferences
    if (details.isVirtual && canSendInvites) {
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
            conferenceDataVersion: (details.isVirtual && canSendInvites) ? 1 : 0,
            // Send email invitations if Domain-Wide Delegation is configured
            sendUpdates: canSendInvites ? "all" : "none",
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
    const canSendInvites = !!process.env.GOOGLE_IMPERSONATE_EMAIL;

    try {
        await calendar.events.delete({
            calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
            eventId,
            // Send cancellation emails if Domain-Wide Delegation is configured
            sendUpdates: canSendInvites ? "all" : "none",
        });
        return true;
    } catch (error) {
        console.error("Error deleting Google Calendar event:", error);
        return false;
    }
}
