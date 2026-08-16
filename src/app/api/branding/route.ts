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

    const companyId = (session.user as { companyId?: string }).companyId;
    const role = (session.user as { role?: string }).role;

    // A Super Admin's companyId is just a placeholder (they aren't scoped to
    // any single center) — never resolve branding from it.
    if (!companyId || role === "SUPER_ADMIN") {
        return NextResponse.json({
            name: "HealthSaaS",
            logoUrl: null,
            primaryColor: "#1E5078",
            secondaryColor: "#34B8A0",
            tertiaryColor: "#3282B4",
            specialty: null,
            modules: null
        });
    }

    try {
        const company = await prisma.company.findUnique({

            where: { id: companyId },
            select: {
                name: true,
                logoUrl: true,
                primaryColor: true,
                secondaryColor: true,
                tertiaryColor: true,
                specialty: true,
                plan: { select: { modules: true } }
            }
        });

        if (!company) {
            return NextResponse.json({
                name: "HealthSaaS",
                logoUrl: null,
                primaryColor: "#1E5078",
                secondaryColor: "#34B8A0",
                tertiaryColor: "#3282B4",
                specialty: null,
                modules: null
            });
        }

        return NextResponse.json({
            name: company.name,
            logoUrl: company.logoUrl || null,
            primaryColor: company.primaryColor || "#1E5078",
            secondaryColor: company.secondaryColor || "#34B8A0",
            tertiaryColor: company.tertiaryColor || "#3282B4",
            specialty: company.specialty || null,
            // null = no plan assigned = unlimited/all modules (see src/lib/specialty.ts hasModule)
            modules: company.plan?.modules ?? null
        });
    } catch (error) {
        console.error("Error fetching branding:", error);
        return NextResponse.json({
            name: "HealthSaaS",
            logoUrl: null,
            primaryColor: "#1E5078",
            secondaryColor: "#34B8A0",
            tertiaryColor: "#3282B4"
        });
    }
}
