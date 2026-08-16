import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

// Both the assigned professional AND the center's admin can read/write
// clinical notes. Admin access exists specifically for plans without
// PORTAL_ACCESS: the professional record still exists but can never log in
// (see User.portalAccess), so the admin has to be able to document the
// visit on their behalf — otherwise a Básico-plan center could never record
// anything for that professional's appointments at all.

export async function GET(req: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
    const session = await getServerSession(authOptions);
    const { patientId } = await params;
    const role = (session?.user as any)?.role;

    if (!session || (role !== "PSYCHOLOGIST" && role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;

    try {
        if (role === "PSYCHOLOGIST") {
            const psychologistId = (session.user as any).profileId;
            const assignment = await (prisma as any).patientPsychologist.findFirst({
                where: { patientId, psychologistId }
            });
            if (!assignment) {
                return NextResponse.json({ error: "Patient not assigned to you" }, { status: 403 });
            }
        } else {
            // ADMIN: any patient belonging to their own company.
            const patient = await prisma.profile.findFirst({
                where: { id: patientId, user: { companyId } }
            });
            if (!patient) {
                return NextResponse.json({ error: "Patient not found" }, { status: 404 });
            }
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
    const { content, psychologistId: attributedToId } = await req.json();
    const role = (session?.user as any)?.role;

    if (!session || (role !== "PSYCHOLOGIST" && role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    let psychologistId: string;

    try {
        if (role === "PSYCHOLOGIST") {
            psychologistId = (session.user as any).profileId;
            const assignment = await (prisma as any).patientPsychologist.findFirst({
                where: { patientId, psychologistId }
            });
            if (!assignment) {
                return NextResponse.json({ error: "Patient not assigned to you" }, { status: 403 });
            }
        } else {
            // ADMIN must say which of the patient's assigned professionals
            // this note is being written on behalf of.
            if (!attributedToId) {
                return NextResponse.json({ error: "Falta indicar el profesional" }, { status: 400 });
            }
            const assignment = await (prisma as any).patientPsychologist.findFirst({
                where: { patientId, psychologistId: attributedToId },
                include: { psychologist: { include: { user: { select: { companyId: true } } } } }
            });
            if (!assignment || assignment.psychologist.user.companyId !== companyId) {
                return NextResponse.json({ error: "Ese profesional no está asignado a este paciente" }, { status: 403 });
            }
            psychologistId = attributedToId;
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
