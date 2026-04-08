import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !["PSYCHOLOGIST", "ADMIN"].includes((session.user as any).role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    const profileId = (session.user as any).profileId;
    const role = (session.user as any).role;

    try {
        const waitlist = await (prisma as any).waitlist.findMany({
            where: {
                companyId,
                ...(role === "PSYCHOLOGIST" ? { psychologistId: profileId } : {})
            },
            include: {
                patient: {
                    include: {
                        user: { select: { name: true, email: true } }
                    }
                }
            },
            orderBy: { createdAt: "asc" }
        });

        const formattedWaitlist = waitlist.map((w: any) => ({
            id: w.id,
            name: w.patient.user.name,
            addedDate: w.createdAt,
            priority: "Media", // Map logic if priority is added to schema later
            reason: "Primera vez", // Map if added to schema
            preferredSchedule: "Todos los horarios"
        }));

        return NextResponse.json(formattedWaitlist);
    } catch (error) {
        console.error("Error fetching waitlist:", error);
        return NextResponse.json({ error: "Error fetching waitlist" }, { status: 500 });
    }
}
