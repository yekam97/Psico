import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";
import { hasModule, PLAN_MODULES } from "@/lib/specialty";

// Optometry refraction records — same shape/auth pattern as tooth-records
// (src/app/api/professional/tooth-records/[patientId]/route.ts): the
// assigned professional or the center's admin (on behalf of a professional
// without portal access) can read/write.

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
            const doctorId = (session.user as any).profileId;
            const assignment = await prisma.patientPsychologist.findFirst({
                where: { patientId, psychologistId: doctorId }
            });
            if (!assignment) {
                return NextResponse.json({ error: "Patient not assigned to you" }, { status: 403 });
            }
        } else {
            const patient = await prisma.profile.findFirst({
                where: { id: patientId, user: { companyId } }
            });
            if (!patient) {
                return NextResponse.json({ error: "Patient not found" }, { status: 404 });
            }
        }

        const records = await (prisma as any).optometryRecord.findMany({
            where: { patientId, companyId },
            include: {
                doctor: { include: { user: { select: { name: true } } } }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(records);
    } catch (error) {
        console.error("Error fetching optometry records:", error);
        return NextResponse.json({ error: "Error fetching optometry records" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
    const session = await getServerSession(authOptions);
    const { patientId } = await params;
    const body = await req.json();
    const { psychologistId: attributedToId, appointmentId, notes, ...refraction } = body;
    const role = (session?.user as any)?.role;

    if (!session || (role !== "PSYCHOLOGIST" && role !== "ADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasAnyValue = ["odSphere", "odCylinder", "odAxis", "odVisualAcuity", "osSphere", "osCylinder", "osAxis", "osVisualAcuity"]
        .some((k) => refraction[k]?.toString().trim());
    if (!hasAnyValue && !notes?.trim()) {
        return NextResponse.json({ error: "Registra al menos un valor de la fórmula o una nota" }, { status: 400 });
    }

    const companyId = (session.user as any).companyId;
    let doctorId: string;

    try {
        const company = await (prisma.company as any).findUnique({
            where: { id: companyId },
            select: { plan: { select: { modules: true } } }
        });

        if (!hasModule(company?.plan?.modules ?? null, PLAN_MODULES.OPTOMETRY_RECORD)) {
            return NextResponse.json({ error: "Tu plan actual no incluye el módulo de Registro de Optometría." }, { status: 403 });
        }

        if (role === "PSYCHOLOGIST") {
            doctorId = (session.user as any).profileId;
            const assignment = await prisma.patientPsychologist.findFirst({
                where: { patientId, psychologistId: doctorId }
            });
            if (!assignment) {
                return NextResponse.json({ error: "Patient not assigned to you" }, { status: 403 });
            }
        } else {
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
            doctorId = attributedToId;
        }

        const record = await (prisma as any).optometryRecord.create({
            data: {
                patientId,
                doctorId,
                companyId,
                appointmentId: appointmentId || null,
                notes: notes || null,
                odSphere: refraction.odSphere || null,
                odCylinder: refraction.odCylinder || null,
                odAxis: refraction.odAxis || null,
                odVisualAcuity: refraction.odVisualAcuity || null,
                osSphere: refraction.osSphere || null,
                osCylinder: refraction.osCylinder || null,
                osAxis: refraction.osAxis || null,
                osVisualAcuity: refraction.osVisualAcuity || null
            }
        });

        return NextResponse.json(record);
    } catch (error) {
        console.error("Error creating optometry record:", error);
        return NextResponse.json({ error: "Error creating optometry record" }, { status: 500 });
    }
}
