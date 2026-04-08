import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

/**
 * Public branding endpoint — accessible by ALL roles (admin, psychologist, patient).
 * Returns the company's logo, primary color, secondary color, and name.
 */
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    if (!companyId) {
        return NextResponse.json({
            name: "HealthSaaS",
            logoUrl: null,
            primaryColor: "#24343B",
            secondaryColor: "#EBA554",
            tertiaryColor: "#948472"
        });
    }

    try {
        const company = await (prisma.company as any).findUnique({
            where: { id: companyId },
            select: {
                name: true,
                logoUrl: true,
                primaryColor: true,
                secondaryColor: true,
                tertiaryColor: true
            }
        });

        if (!company) {
            return NextResponse.json({
                name: "HealthSaaS",
                logoUrl: null,
                primaryColor: "#24343B",
                secondaryColor: "#EBA554",
                tertiaryColor: "#948472"
            });
        }

        return NextResponse.json({
            name: company.name,
            logoUrl: company.logoUrl || null,
            primaryColor: company.primaryColor || "#24343B",
            secondaryColor: company.secondaryColor || "#EBA554",
            tertiaryColor: company.tertiaryColor || "#948472"
        });
    } catch (error) {
        console.error("Error fetching branding:", error);
        return NextResponse.json({
            name: "HealthSaaS",
            logoUrl: null,
            primaryColor: "#24343B",
            secondaryColor: "#EBA554",
            tertiaryColor: "#948472"
        });
    }
}
