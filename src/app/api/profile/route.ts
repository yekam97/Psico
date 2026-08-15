import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profileId = (session.user as any).profileId;

    try {
        const profile = profileId
            ? await (prisma as any).profile.findUnique({ where: { id: profileId }, select: { phone: true } })
            : null;

        return NextResponse.json({ phone: profile?.phone || "" });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({ error: "Error al cargar el perfil" }, { status: 500 });
    }
}

// Updates the logged-in user's own profile: name, phone, avatar.
// Anyone (any role) may update their own record — no separate role check needed
// beyond "must be signed in", since every field is scoped to session.user.id.
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const profileId = (session.user as any).profileId;
    const { name, phone, avatarUrl } = await req.json();

    try {
        const userData: { name?: string; avatarUrl?: string } = {};
        if (typeof name === "string" && name.trim()) userData.name = name.trim();
        if (typeof avatarUrl === "string") userData.avatarUrl = avatarUrl;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: userData
        });

        if (profileId && typeof phone === "string") {
            await (prisma as any).profile.update({
                where: { id: profileId },
                data: { phone }
            });
        }

        return NextResponse.json({
            name: updatedUser.name,
            avatarUrl: (updatedUser as any).avatarUrl
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Error al actualizar el perfil" }, { status: 500 });
    }
}
