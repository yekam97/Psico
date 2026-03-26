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
            {/* Header section with branding toggle? No, just the summary */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-primary text-white p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-xl relative overflow-hidden gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
                <div className="relative z-10">
                    <h2 className="text-2xl md:text-3xl font-light mb-2">Panel Administrativo</h2>
                    <p className="text-white/60 text-sm md:text-base">Métricas clave y gestión estratégica de HealthSaaS.</p>
                </div>
                <button className="bg-secondary text-primary-dark px-6 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold hover:bg-secondary-light transition-all shadow-md relative z-10 text-sm md:text-base w-full md:w-auto">
                    Exportar Datos
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {statCards.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4 md:gap-6 group hover:border-secondary/20 transition-all">
                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform shrink-0`}>
                            <stat.icon className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs md:text-sm text-gray-500 font-medium truncate">{stat.label}</p>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-800">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Charts Section */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-light">Evolución de Citas (3 Meses)</h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.chartData || []}>
                                    <defs>
                                        <linearGradient id="colorAppts" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#24343B" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#24343B" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="appointments" stroke="#24343B" strokeWidth={3} fillOpacity={1} fill="url(#colorAppts)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Users Section */}
                    <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="text-lg md:text-xl font-light">Usuarios Recientes</h3>
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
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Reporte Semanal Sidebar */}
                <div className="space-y-6">
                    <div className="bg-[#1a2b3b] text-white p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 md:p-8 transform group-hover:scale-110 transition-transform">
                            <ArrowUpRight className="w-8 h-8 md:w-12 md:h-12 text-primary/20" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-light mb-6 md:mb-8 text-secondary">Reporte Semanal</h3>
                        <div className="space-y-4 md:space-y-6">
                            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                        <Video size={18} />
                                    </div>
                                    <div>
                                        <p className="text-white/50 text-xs md:text-sm">Virtuales</p>
                                        <p className="text-xl font-bold">{reports?.virtual || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
                                        <UserCheck size={18} />
                                    </div>
                                    <div>
                                        <p className="text-white/50 text-xs md:text-sm">Presenciales</p>
                                        <p className="text-xl font-bold">{reports?.inPerson || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-400/20 flex items-center justify-center text-red-400">
                                        <XCircle size={18} />
                                    </div>
                                    <div>
                                        <p className="text-white/50 text-xs md:text-sm">Cancelaciones</p>
                                        <p className="text-xl font-bold">{reports?.totalCancelled || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleExport}
                                className="w-full bg-primary text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-medium mt-2 hover:bg-primary-light transition-all text-sm md:text-base"
                            >
                                Descargar Detalle
                            </button>
                        </div>
                    </div>

                    {/* Detalle de Cancelaciones */}
                    {reports?.cancellationDetails?.length > 0 && (
                        <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Motivos de Cancelación</h4>
                            <div className="space-y-4">
                                {reports.cancellationDetails.slice(0, 3).map((c: any, i: number) => (
                                    <div key={i} className="text-xs border-l-2 border-red-400 pl-3">
                                        <p className="font-bold text-gray-700">{c.patient} - {c.psychologist}</p>
                                        <p className="text-gray-400 italic">"{c.reason}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
