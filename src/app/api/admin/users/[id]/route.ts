import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const { id } = params;

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    const { email, password, name, role, psychologistIds, phone } = await req.json();

    try {
        const updatedUser = await prisma.$transaction(async (tx) => {
            // Find user first to confirm companyId and profile
            const existingUser = await tx.user.findFirst({
                where: { id, companyId },
                include: { profile: true }
            });

            if (!existingUser) throw new Error("User not found");

            // Update Basic User Info
            const user = await tx.user.update({
                where: { id },
                data: {
                    email,
                    ...(password ? { password } : {}), // Update password only if provided
                    name,
                    role: role as Role,
                    profile: {
                        update: {
                            phone,
                        }
                    }
                },
                include: { profile: true }
            });

            // Handle assignments if role is PATIENT
            if (role === "PATIENT") {
                // Remove all existing assignments first
                await (tx as any).patientPsychologist.deleteMany({
                    where: { patientId: user.profile!.id }
                });

                // Create new assignments (max 2)
                if (psychologistIds && psychologistIds.length > 0) {
                    const newAssignments = psychologistIds.slice(0, 2).map((pid: string) => ({
                        patientId: user.profile!.id,
                        psychologistId: pid
                    }));

                    await (tx as any).patientPsychologist.createMany({
                        data: newAssignments
                    });
                }
            } else {
                // If role changed from PATIENT, we should cleanup assignments where they are the patient
                await (tx as any).patientPsychologist.deleteMany({
                    where: { patientId: user.profile!.id }
                });
            }

            return user;
        });

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: error.message || "Error updating user" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const { id } = params;

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;

    try {
        // Confirm user belongs to company
        const user = await prisma.user.findFirst({
            where: { id, companyId },
            include: { profile: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Delete user ( cascade delete via prisma transaction to ensure clean up if not using native DB cascade)
        await prisma.$transaction(async (tx) => {
            if (user.profile) {
                const profileId = user.profile.id;

                // Delete assignments
                await tx.patientPsychologist.deleteMany({
                    where: { OR: [{ patientId: profileId }, { psychologistId: profileId }] }
                });

                // Delete therapy inventory
                if (user.role === "PATIENT") {
                    await tx.therapyInventory.deleteMany({ where: { patientId: profileId } });
                }

                // Delete notes, appointments etc. or mark as deleted? For now, we clean up
                await tx.appointment.deleteMany({
                    where: { OR: [{ patientId: profileId }, { psychologistId: profileId }] }
                });
                await tx.clinicalNote.deleteMany({
                    where: { OR: [{ patientId: profileId }, { psychologistId: profileId }] }
                });
                await tx.availability.deleteMany({ where: { psychologistId: profileId } });
                await tx.waitlist.deleteMany({ where: { patientId: profileId } });

                // Finally delete profile
                await tx.profile.delete({ where: { id: profileId } });
            }

            // Delete User
            await tx.user.delete({ where: { id } });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
    }
}
