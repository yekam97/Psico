"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Users,
    Calendar,
    TrendingUp,
    Activity,
    ArrowUpRight,
    Loader2,
    Video,
    Phone,
    Mail,
    XCircle,
    CalendarClock,
    AlertTriangle
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
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
                axios.get("/api/admin/users")
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
        {
            label: "Citas Hoy",
            value: stats?.todayAppointments ?? 0,
            icon: CalendarClock,
            color: "text-blue-500",
            bg: "bg-blue-50",
            sub: "sesiones programadas"
        },
        {
            label: "Pacientes Activos",
            value: stats?.totalPatients ?? 0,
            icon: Users,
            color: "text-primary",
            bg: "bg-primary/10",
            sub: `crecimiento: ${stats?.patientGrowth ?? 0}%`
        },
        {
            label: "Citas del Mes",
            value: stats?.monthAppointments ?? 0,
            icon: Calendar,
            color: "text-green-500",
            bg: "bg-green-50",
            sub: `vs. mes anterior: ${stats?.appointmentGrowth ?? 0}%`
        },
        {
            label: "Cancelaciones (semana)",
            value: stats?.totalCancelled ?? 0,
            icon: XCircle,
            color: "text-red-500",
            bg: "bg-red-50",
            sub: "ver detalle abajo"
        },
    ];

    const chartData = stats?.chartData || [];
    const cancellationDetails = stats?.cancellationDetails || [];

    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-primary text-white p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-xl relative overflow-hidden gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
                <div className="relative z-10">
                    <h2 className="text-2xl md:text-3xl font-light mb-2">Bienvenido, {session?.user?.name}</h2>
                    <p className="text-white/60 text-sm md:text-base">Gestiona tu centro de salud desde este panel central.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="bg-secondary text-primary-dark px-6 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold hover:bg-secondary-light transition-all shadow-md relative z-10 text-sm md:text-base w-full md:w-auto"
                >
                    Exportar Reporte Semanal
                </button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {statCards.map((s, i) => (
                    <div key={i} className="bg-white p-5 md:p-7 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <s.icon className={`${s.color} w-6 h-6`} />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mt-1">{s.value}</h3>
                        <p className="text-[10px] text-gray-400 mt-1">{s.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                    <h3 className="text-lg md:text-xl font-light text-gray-800">Citas por Mes</h3>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorAppt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#24343B" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#24343B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="appointments" stroke="#24343B" fill="url(#colorAppt)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-400 text-sm">No hay datos de citas para el gráfico.</p>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-[#1a2b3b] text-white p-8 rounded-[2.5rem] shadow-xl">
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
                            <Link href="/dashboard/admin/therapy" className="block p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5">
                                <p className="font-bold text-sm">Gestionar Terapias</p>
                                <p className="text-xs text-white/40">Asigna sesiones a pacientes.</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
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
                                    <td className="px-6 md:px-8 py-4 md:py-5 font-medium text-gray-800 text-sm">
                                        <div className="flex flex-col">
                                            <span>{user.name}</span>
                                            <span className="text-[10px] text-gray-400 uppercase font-bold">{user.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-8 py-4 md:py-5 text-xs text-gray-500">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1"><Mail size={12} /> {user.email}</div>
                                            {user.profile?.phone && <div className="flex items-center gap-1 font-bold text-primary"><Phone size={12} /> {user.profile.phone}</div>}
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-8 py-4 md:py-5">
                                        <span className="px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase bg-green-50 text-green-600">Activo</span>
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

            {/* Cancellations Detail Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-50 flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-xl">
                        <AlertTriangle className="text-red-400 w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-light text-gray-800">Cancelaciones de la Semana</h3>
                        <p className="text-xs text-gray-400">Historial de citas canceladas y sus motivos registrados.</p>
                    </div>
                </div>

                {cancellationDetails.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <XCircle className="mx-auto mb-4 text-gray-200" size={40} />
                        <p>No hay cancelaciones registradas esta semana. ¡Excelente!</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                                        <th className="px-8 py-4 font-medium">Paciente</th>
                                        <th className="px-8 py-4 font-medium">Psicólogo</th>
                                        <th className="px-8 py-4 font-medium">Fecha</th>
                                        <th className="px-8 py-4 font-medium">Motivo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {cancellationDetails.map((c: any) => (
                                        <tr key={c.id} className="hover:bg-red-50/30 transition-colors">
                                            <td className="px-8 py-5 font-semibold text-gray-800 text-sm">{c.patient}</td>
                                            <td className="px-8 py-5 text-sm text-gray-600">{c.psychologist}</td>
                                            <td className="px-8 py-5 text-xs text-gray-500">
                                                {format(new Date(c.date), "d MMM yyyy, HH:mm", { locale: es })}
                                            </td>
                                            <td className="px-8 py-5 text-sm italic text-gray-500">"{c.reason}"</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Mobile cards */}
                        <div className="md:hidden space-y-4 p-4">
                            {cancellationDetails.map((c: any) => (
                                <div key={c.id} className="bg-red-50/40 p-4 rounded-2xl border border-red-100 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-gray-800 text-sm">{c.patient}</p>
                                        <span className="text-[10px] text-gray-400">{format(new Date(c.date), "d MMM, HH:mm", { locale: es })}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Psicólogo: {c.psychologist}</p>
                                    <p className="text-xs italic text-red-500 border-t border-red-100 pt-2 mt-2">Motivo: "{c.reason}"</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
