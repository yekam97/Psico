import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contactId = req.nextUrl.searchParams.get("contactId");
    if (!contactId) return NextResponse.json({ error: "Missing contactId" }, { status: 400 });

    const userId = (session.user as any).id;
    const companyId = (session.user as any).companyId;

    try {
        const messages = await (prisma as any).message.findMany({
            where: {
                companyId,
                OR: [
                    { senderId: userId, receiverId: contactId },
                    { senderId: contactId, receiverId: userId }
                ]
            },
            orderBy: { createdAt: "asc" }
        });

        return NextResponse.json(messages);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching messages" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { receiverId, content } = await req.json();
    const userId = (session.user as any).id;
    const companyId = (session.user as any).companyId;

    try {
        const message = await (prisma as any).message.create({
            data: {
                content,
                senderId: userId,
                receiverId,
                companyId
            }
        });

        return NextResponse.json(message);
    } catch (error) {
        return NextResponse.json({ error: "Error sending message" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { senderId } = await req.json();
    const userId = (session.user as any).id;
    const companyId = (session.user as any).companyId;

    try {
        await (prisma as any).message.updateMany({
            where: {
                senderId,
                receiverId: userId,
                companyId,
                isRead: false
            },
            data: { isRead: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Error marking messages as read" }, { status: 500 });
    }
}
