import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
    const session = await getServerSession(authOptions);
    const { patientId } = await params;

    if (!session || (session.user as any).role !== "PSYCHOLOGIST") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const psychologistId = (session.user as any).profileId;
    const companyId = (session.user as any).companyId;

    try {
        // Verify assignment
        const assignment = await (prisma as any).patientPsychologist.findFirst({
            where: { patientId, psychologistId }
        });

        if (!assignment) {
            return NextResponse.json({ error: "Patient not assigned to you" }, { status: 403 });
        }

        const notes = await (prisma as any).clinicalNote.findMany({
            where: { patientId, companyId },
            include: {
                psychologist: {
                    include: { user: { select: { name: true } } }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(notes);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching notes" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
    const session = await getServerSession(authOptions);
    const { patientId } = await params;
    const { content } = await req.json();

    if (!session || (session.user as any).role !== "PSYCHOLOGIST") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const psychologistId = (session.user as any).profileId;
    const companyId = (session.user as any).companyId;

    try {
        // Verify assignment
        const assignment = await (prisma as any).patientPsychologist.findFirst({
            where: { patientId, psychologistId }
        });

        if (!assignment) {
            return NextResponse.json({ error: "Patient not assigned to you" }, { status: 403 });
        }

        const note = await (prisma as any).clinicalNote.create({
            data: {
                patientId,
                psychologistId,
                companyId,
                content
            }
        });

        return NextResponse.json(note);
    } catch (error) {
        return NextResponse.json({ error: "Error creating note" }, { status: 500 });
    }
}
