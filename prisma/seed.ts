import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting seed...");

    const tenantsPath = path.join(__dirname, "tenants.json");
    if (!fs.existsSync(tenantsPath)) {
        console.error("tenants.json not found. Skipping seed.");
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
        }
    }

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
