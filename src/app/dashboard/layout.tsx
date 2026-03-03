"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Calendar,
    Users,
    Settings,
    LogOut,
    User as UserIcon,
    PlusCircle,
    FileText,
    Clock
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { getTenantBranding } from "@/lib/tenant";

interface SidebarItemProps {
    href: string;
    icon: any;
    label: string;
    active?: boolean;
}

const SidebarItem = ({ href, icon: Icon, label, active }: SidebarItemProps) => (
    <Link
        href={href}
        className={`flex items-center gap-3 px-6 py-4 transition-all duration-200 group ${active
            ? "bg-primary/10 text-primary border-r-4 border-primary"
            : "text-gray-500 hover:bg-gray-50 hover:text-primary"
            }`}
    >
        <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-gray-400 group-hover:text-primary"}`} />
        <span className="font-medium">{label}</span>
    </Link>
);

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;
    const companyId = (session?.user as any)?.companyId;

    // Resolve tenant branding
    const branding = getTenantBranding(companyId);

    const menuItems = {
        ADMIN: [
            { href: "/dashboard/admin", icon: LayoutDashboard, label: "Vista General" },
            { href: "/dashboard/admin/users", icon: Users, label: "Gestionar Usuarios" },
            { href: "/dashboard/admin/stats", icon: FileText, label: "Estadísticas" },
            { href: "/dashboard/profile", icon: Settings, label: "Mi Perfil" },
        ],
        PSYCHOLOGIST: [
            { href: "/dashboard/psychologist", icon: LayoutDashboard, label: "Mis Citas" },
            { href: "/dashboard/psychologist/patients", icon: Users, label: "Mis Pacientes" },
            { href: "/dashboard/psychologist/waitlist", icon: Clock, label: "Lista de Espera" },
            { href: "/dashboard/psychologist/availability", icon: Calendar, label: "Disponibilidad" },
            { href: "/dashboard/profile", icon: Settings, label: "Mi Perfil" },
        ],
        PATIENT: [
            { href: "/dashboard/patient", icon: LayoutDashboard, label: "Mis Reservas" },
            { href: "/dashboard/patient/book", icon: PlusCircle, label: "Agendar Cita" },
            { href: "/dashboard/profile", icon: Settings, label: "Mi Perfil" },
        ],
    };

    const currentMenu = menuItems[userRole as keyof typeof menuItems] || [];

    return (
        <div className="flex min-h-screen bg-[#fcfdfc]">
            {/* Inject Dynamic Colors if they differ from default */}
            <style jsx global>{`
                :root {
                    --color-primary: ${branding.primaryColor};
                    --color-secondary: ${branding.secondaryColor};
                    --color-tertiary: ${branding.tertiaryColor};
                }
            `}</style>

            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-100 flex flex-col shadow-sm">
                <div className="p-8 pb-4">
                    <Logo
                        brandName={branding.name}
                        brandSubtitle={branding.subtitle}
                        variant={branding.logoVariant}
                    />
                </div>

                <nav className="flex-1 mt-4">
                    {currentMenu.map((item) => (
                        <SidebarItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            active={pathname === item.href}
                        />
                    ))}
                </nav>

                <div className="p-6 border-t border-gray-50">
                    <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-gray-50 rounded-2xl">
                        <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                            <UserIcon className="w-6 h-6" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-gray-800 truncate">{session?.user?.name || "Usuario"}</p>
                            <p className="text-xs text-gray-400 truncate capitalize">{userRole?.toLowerCase()}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-3 px-6 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group"
                    >
                        <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-10">
                    <h1 className="text-xl font-light text-gray-800">
                        {pathname.includes("admin") ? "Panel Administrativo" :
                            pathname.includes("psychologist") ? "Panel de Psicólogo" : "Portal de Paciente"}
                    </h1>
                    <div className="text-sm text-gray-400 font-mono">
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>
                <div className="p-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
