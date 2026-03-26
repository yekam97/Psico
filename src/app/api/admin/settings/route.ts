import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;

    try {
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: {
                name: true,
                logoUrl: true,
                primaryColor: true,
                secondaryColor: true,
                tertiaryColor: true,
                businessHours: true
            }
        });

        return NextResponse.json(company);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ error: "Error fetching settings" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    const { logoUrl, primaryColor, secondaryColor, tertiaryColor, businessHours } = await req.json();

    try {
        const updatedCompany = await prisma.company.update({
            where: { id: companyId },
            data: {
                logoUrl,
                primaryColor,
                secondaryColor,
                tertiaryColor,
                businessHours
            }
        });

        return NextResponse.json(updatedCompany);
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ error: "Error updating settings" }, { status: 500 });
    }
}
