import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, companyId, profileId, id: userId } = session.user as any;

    try {
        let contacts: any[] = [];

        // Fetch unread counts for all potential senders to this user
        const unreadCounts = await (prisma as any).message.groupBy({
            by: ['senderId'],
            where: {
                receiverId: userId,
                companyId,
                isRead: false
            },
            _count: { id: true }
        });

        const unreadMap = unreadCounts.reduce((acc: any, curr: any) => {
            acc[curr.senderId] = curr._count.id;
            return acc;
        }, {});

        if (role === "ADMIN") {
            // Admins see everyone in the company
            const users = await prisma.user.findMany({
                where: {
                    companyId,
                    id: { not: userId }
                },
                select: { id: true, name: true, email: true, role: true }
            });
            contacts = users;
        } else if (role === "PSYCHOLOGIST") {
            // Psychologists see their patients and all admins
            const admins = await prisma.user.findMany({
                where: { companyId, role: "ADMIN" },
                select: { id: true, name: true, email: true, role: true }
            });

            const assignments = await (prisma as any).patientPsychologist.findMany({
                where: { psychologistId: profileId },
                include: {
                    patient: {
                        include: {
                            user: { select: { id: true, name: true, email: true, role: true } }
                        }
                    }
                }
            });

            const patients = assignments.map((a: any) => a.patient.user);
            contacts = [...admins, ...patients];
        } else if (role === "PATIENT") {
            // Patients see their psychologists and all admins
            const admins = await prisma.user.findMany({
                where: { companyId, role: "ADMIN" },
                select: { id: true, name: true, email: true, role: true }
            });

            const assignments = await (prisma as any).patientPsychologist.findMany({
                where: { patientId: profileId },
                include: {
                    psychologist: {
                        include: {
                            user: { select: { id: true, name: true, email: true, role: true } }
                        }
                    }
                }
            });

            const psychologists = assignments.map((a: any) => a.psychologist.user);
            contacts = [...admins, ...psychologists];
        }

        const contactsWithUnread = contacts.map(c => ({
            ...c,
            unreadCount: unreadMap[c.id] || 0
        }));

        return NextResponse.json(contactsWithUnread);
    } catch (error) {
        console.error("Error fetching chat contacts:", error);
        return NextResponse.json({ error: "Error fetching contacts" }, { status: 500 });
    }
}
