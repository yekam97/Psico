import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";
import { professionalLabel } from "@/lib/specialty";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "PATIENT") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patientProfileId = (session.user as any).profileId;
    const companyId = (session.user as any).companyId;

    if (!patientProfileId) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    try {
        const company = await (prisma.company as any).findUnique({
            where: { id: companyId },
            select: { specialty: true }
        });
        const proLabel = professionalLabel(company?.specialty);

        const assignments = await (prisma as any).patientPsychologist.findMany({
            where: { patientId: patientProfileId },
            include: {
                psychologist: {
                    include: {
                        user: {
                            select: { name: true, email: true }
                        }
                    }
                }
            }
        });

        const psychologists = assignments.map((a: any) => ({
            id: a.psychologist.id,
            name: a.psychologist.user.name,
            specialty: a.psychologist.specialty || proLabel,
            rating: 5.0 // Mock rating for now
        }));

        return NextResponse.json(psychologists);
    } catch (error) {
        console.error("Error fetching patient psychologists:", error);
        return NextResponse.json({ error: "Error fetching psychologists" }, { status: 500 });
    }
}
