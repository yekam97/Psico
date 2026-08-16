import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function seedPlatformDefaults() {
    console.log("Seeding platform-level defaults (plans, super admin)...");

    // ODONTOGRAM/OPTOMETRY_RECORD are on every tier — the specialty's core
    // clinical tool isn't a paywalled differentiator, it's table stakes for
    // a dental/optometry center to function at all. PORTAL_ACCESS (patient/
    // professional login) and CHAT are what actually differentiate tiers.
    const plans = [
        // No PORTAL_ACCESS: admin can still create patient/professional
        // records for note-taking, but those accounts can't log in
        // (User.portalAccess is forced false — see /api/admin/users).
        { name: "Básico", maxPatients: 50, maxProfessionals: 3, modules: ["ODONTOGRAM", "OPTOMETRY_RECORD"] },
        { name: "Intermedio", maxPatients: 300, maxProfessionals: 15, modules: ["PORTAL_ACCESS", "ODONTOGRAM", "OPTOMETRY_RECORD"] },
        { name: "Pro", maxPatients: null, maxProfessionals: null, modules: ["PORTAL_ACCESS", "ODONTOGRAM", "OPTOMETRY_RECORD", "CHAT"] },
    ];
    for (const plan of plans) {
        await prisma.plan.upsert({
            where: { name: plan.name },
            update: {},
            create: plan
        });
    }

    // SUPER_ADMIN isn't scoped to any company, but the schema requires a
    // companyId on User — attach it to whichever company happens to exist
    // first as a harmless placeholder. The app must never use a
    // SUPER_ADMIN's companyId for data scoping (see src/app/api/branding).
    const anyCompany = await prisma.company.findFirst();
    if (anyCompany) {
        const existingSuperAdmin = await prisma.user.findUnique({ where: { email: "super@minerva.com" } });
        if (!existingSuperAdmin) {
            const hashed = await bcrypt.hash("super123", 10);
            await prisma.user.create({
                data: {
                    email: "super@minerva.com",
                    password: hashed,
                    role: "SUPER_ADMIN",
                    name: "Super Admin",
                    companyId: anyCompany.id
                }
            });
            console.log("  Created super admin: super@minerva.com / super123 (change this in production)");
        }
    }
}

async function main() {
    console.log("Starting seed...");

    const tenantsPath = path.join(__dirname, "tenants.json");
    if (!fs.existsSync(tenantsPath)) {
        console.error("tenants.json not found. Skipping tenant seed.");
        await seedPlatformDefaults();
        return;
    }

    const tenants = JSON.parse(fs.readFileSync(tenantsPath, "utf-8"));

    for (const tenant of tenants) {
        console.log(`Processing center: ${tenant.company.name}`);

        const company = await prisma.company.upsert({
            where: { id: tenant.company.id },
            update: {
                name: tenant.company.name,
                domain: tenant.company.domain
            },
            create: {
                id: tenant.company.id,
                name: tenant.company.name,
                domain: tenant.company.domain
            }
        });

        for (const userData of tenant.users) {
            console.log(`  Creating user: ${userData.email} (${userData.role})`);
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const user = await prisma.user.upsert({
                where: { email: userData.email },
                update: {
                    name: userData.name,
                    password: hashedPassword,
                    role: userData.role,
                    companyId: company.id
                },
                create: {
                    email: userData.email,
                    name: userData.name,
                    password: hashedPassword,
                    role: userData.role,
                    companyId: company.id
                }
            });

            // Create or Update Profile
            const profile = await prisma.profile.upsert({
                where: {
                    userId: user.id
                },
                update: {},
                create: {
                    id: userData.profileId, // Use fixed ID if provided for demo stability
                    userId: user.id,
                    phone: "123456789"
                }
            });

            // If Patient, ensure Therapy Inventory exists
            if (userData.role === "PATIENT") {
                await prisma.therapyInventory.upsert({
                    where: { patientId: profile.id },
                    update: {},
                    create: {
                        patientId: profile.id,
                        totalAssigned: 10,
                        remaining: 5
                    }
                });
            }

            // If Psychologist, create default availability (Mon-Fri 9:00-17:00)
            if (userData.role === "PSYCHOLOGIST") {
                // Clear existing availability for this psychologist
                await prisma.availability.deleteMany({
                    where: { psychologistId: profile.id }
                });

                // Create availability for Mon-Fri
                for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) {
                    await prisma.availability.create({
                        data: {
                            psychologistId: profile.id,
                            companyId: company.id,
                            dayOfWeek,
                            startTime: "09:00",
                            endTime: "17:00",
                            isActive: true
                        }
                    });
                }
                console.log(`    Created availability for ${userData.name}`);
            }
        }
    }

    await seedPlatformDefaults();

    console.log("Seed completed successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
