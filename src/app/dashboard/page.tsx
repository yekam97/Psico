import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const role = (session.user as any).role;

    switch (role) {
        case "ADMIN":
            redirect("/dashboard/admin");
        case "PSYCHOLOGIST":
            redirect("/dashboard/psychologist");
        case "PATIENT":
            redirect("/dashboard/patient");
        default:
            redirect("/");
    }
}
