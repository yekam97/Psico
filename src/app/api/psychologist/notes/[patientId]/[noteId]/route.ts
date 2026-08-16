import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ noteId: string }> }) {
    const session = await getServerSession(authOptions);
    const { noteId } = await params;

    const role = (session?.user as any)?.role;
    if (!session || (role !== "PSYCHOLOGIST" && role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;

    try {
        // Admin can delete any note written for a patient in their company
        // (including ones written on behalf of a portal-less professional);
        // a professional can only delete their own.
        const note = await (prisma as any).clinicalNote.findFirst({
            where: role === "ADMIN"
                ? { id: noteId, companyId }
                : { id: noteId, psychologistId: (session.user as any).profileId, companyId }
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
