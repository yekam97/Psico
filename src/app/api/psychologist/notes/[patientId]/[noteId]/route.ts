import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ noteId: string }> }) {
    const session = await getServerSession(authOptions);
    const { noteId } = await params;

    if (!session || (session.user as any).role !== "PSYCHOLOGIST") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const psychologistId = (session.user as any).profileId;
    const companyId = (session.user as any).companyId;

    try {
        const note = await (prisma as any).clinicalNote.findFirst({
            where: { id: noteId, psychologistId, companyId }
        });

        if (!note) {
            return NextResponse.json({ error: "Note not found or unauthorized to delete" }, { status: 404 });
        }

        await (prisma as any).clinicalNote.delete({
            where: { id: noteId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting note:", error);
        return NextResponse.json({ error: "Error deleting note" }, { status: 500 });
    }
}
