import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";
import { hasModule } from "@/lib/specialty";

// Odontogram entries — same assignment/company guard pattern as clinical
// notes (src/app/api/psychologist/notes/[patientId]/route.ts), just under a
// specialty-neutral path since any PSYCHOLOGIST-role professional at a
// dental/orthodontic company can use it, not only psychologists.

export async function GET(req: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
    const session = await getServerSession(authOptions);
    const { patientId } = await params;

    if (!session || (session.user as any).role !== "PSYCHOLOGIST") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doctorId = (session.user as any).profileId;
    const companyId = (session.user as any).companyId;

    try {
        const assignment = await prisma.patientPsychologist.findFirst({
            where: { patientId, psychologistId: doctorId }
        });

        if (!assignment) {
            return NextResponse.json({ error: "Patient not assigned to you" }, { status: 403 });
        }

        const records = await prisma.toothRecord.findMany({
            where: { patientId, companyId },
            include: {
                doctor: { include: { user: { select: { name: true } } } }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(records);
    } catch (error) {
        console.error("Error fetching tooth records:", error);
        return NextResponse.json({ error: "Error fetching tooth records" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
    const session = await getServerSession(authOptions);
    const { patientId } = await params;
    const { toothNumber, procedure, appointmentId } = await req.json();

    if (!session || (session.user as any).role !== "PSYCHOLOGIST") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!toothNumber || !procedure?.trim()) {
        return NextResponse.json({ error: "Falta el diente o la descripción del procedimiento" }, { status: 400 });
    }

    const doctorId = (session.user as any).profileId;
    const companyId = (session.user as any).companyId;

    try {
        const company = await (prisma.company as any).findUnique({
            where: { id: companyId },
            select: { plan: { select: { modules: true } } }
        });

        if (!hasModule(company?.plan?.modules ?? null, "ODONTOGRAM")) {
            return NextResponse.json({ error: "Tu plan actual no incluye el módulo de Odontograma." }, { status: 403 });
        }

        const assignment = await prisma.patientPsychologist.findFirst({
            where: { patientId, psychologistId: doctorId }
        });

        if (!assignment) {
            return NextResponse.json({ error: "Patient not assigned to you" }, { status: 403 });
        }

        const record = await prisma.toothRecord.create({
            data: {
                patientId,
                doctorId,
                companyId,
                toothNumber: Number(toothNumber),
                procedure: procedure.trim(),
                appointmentId: appointmentId || null
            }
        });

        return NextResponse.json(record);
    } catch (error) {
        console.error("Error creating tooth record:", error);
        return NextResponse.json({ error: "Error creating tooth record" }, { status: 500 });
    }
}
