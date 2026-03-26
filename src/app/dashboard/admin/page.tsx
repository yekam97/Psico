"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Users,
    Calendar,
    TrendingUp,
    Activity,
    ArrowUpRight,
    MoreHorizontal,
    Loader2,
    Video,
    UserCheck,
    XCircle,
    Phone,
    Mail
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<any>(null);
    const [reports, setReports] = useState<any>(null);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, reportsRes, usersRes] = await Promise.all([
                axios.get("/api/admin/stats"),
                axios.get("/api/admin/reports"),
                axios.get("/api/admin/users") // We'll slice in frontend for "recent"
            ]);
            setStats(statsRes.data);
            setReports(reportsRes.data);
            setRecentUsers(usersRes.data.slice(0, 5));
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleExport = () => {
        if (!reports) return;
        const csvContent = [
            ["Categoria", "Valor"],
            ["Citas Virtuales", reports.virtual],
            ["Citas Presenciales", reports.inPerson],
            ["Cancelaciones Totales", reports.totalCancelled],
            ["", ""],
            ["Detalle de Cancelaciones", "Motivo"],
            ...reports.cancellationDetails.map((c: any) => [`${c.patient} - ${c.psychologist}`, c.reason])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_semanal_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-40">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    const statCards = [
        { label: "Citas del Mes", value: stats?.monthAppointments || 0, icon: Calendar, color: "text-blue-500", bg: "bg-blue-50", growth: stats?.appointmentGrowth },
        { label: "Pacientes Activos", value: stats?.totalPatients || 0, icon: Users, color: "text-primary", bg: "bg-primary/10", growth: stats?.patientGrowth },
        { label: "Crecimiento Citas", value: `${stats?.appointmentGrowth}%`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
        { label: "Crecimiento Pacientes", value: `${stats?.patientGrowth}%`, icon: Activity, color: "text-secondary", bg: "bg-secondary/10" },
    ];

    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-primary text-white p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-xl relative overflow-hidden gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
                <div className="relative z-10">
                    <h2 className="text-2xl md:text-3xl font-light mb-2">Bienvenido, {session?.user?.name}</h2>
                    <p className="text-white/60 text-sm md:text-base">Gestiona tu centro de salud HealthSaaS desde este panel central.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="bg-secondary text-primary-dark px-6 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold hover:bg-secondary-light transition-all shadow-md relative z-10 text-sm md:text-base w-full md:w-auto"
                >
                    Exportar Reporte Semanal
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Recent Users Section */}
                <div className="lg:col-span-2 bg-white rounded-3xl md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-lg md:text-xl font-light">Usuarios Recientes</h3>
                        <Link href="/dashboard/admin/users" className="text-xs font-bold text-primary hover:underline">Ver todos</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-gray-400 text-[10px] md:text-xs uppercase tracking-wider">
                                    <th className="px-6 md:px-8 py-4 font-medium">Nombre</th>
                                    <th className="px-6 md:px-8 py-4 font-medium">Detalles</th>
                                    <th className="px-6 md:px-8 py-4 font-medium">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentUsers.map((user, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 md:px-8 py-4 md:py-5 font-medium text-gray-800 text-sm md:text-base">
                                            <div className="flex flex-col">
                                                <span>{user.name}</span>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold">{user.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-8 py-4 md:py-5 text-xs md:text-sm text-gray-500">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1"><Mail size={12} /> {user.email}</div>
                                                {user.profile?.phone && <div className="flex items-center gap-1 font-bold text-primary"><Phone size={12} /> {user.profile.phone}</div>}
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-8 py-4 md:py-5">
                                            <span className={`px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase bg-green-50 text-green-600`}>
                                                Activo
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {recentUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-10 text-center text-gray-400">No hay usuarios registrados recientemente.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Shortcuts / Action Card */}
                <div className="space-y-6">
                    <div className="bg-[#1a2b3b] text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                        <h3 className="text-xl font-light mb-6 text-secondary">Acceso Rápido</h3>
                        <div className="space-y-3">
                            <Link href="/dashboard/admin/users" className="block p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5">
                                <p className="font-bold text-sm">Gestionar Usuarios</p>
                                <p className="text-xs text-white/40">Crear, editar o eliminar psicólogos y pacientes.</p>
                            </Link>
                            <Link href="/dashboard/profile" className="block p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5">
                                <p className="font-bold text-sm">Configuración de Branding</p>
                                <p className="text-xs text-white/40">Actualiza el logo y colores de tu centro.</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
