"use client";

import { useSession } from "next-auth/react";
import {
    Users,
    Calendar,
    TrendingUp,
    Activity,
    UserPlus,
    ArrowUpRight,
    MoreHorizontal
} from "lucide-react";

export default function AdminDashboard() {
    const { data: session } = useSession();

    const stats = [
        { label: "Citas Mensuales", value: "342", icon: Calendar, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Pacientes Activos", value: "128", icon: Users, color: "text-primary", bg: "bg-primary/10" },
        { label: "Tasa de Ocupación", value: "84%", icon: Activity, color: "text-secondary", bg: "bg-secondary/10" },
        { label: "Crecimiento", value: "+12%", icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
    ];

    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-primary text-white p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-xl relative overflow-hidden gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
                <div className="relative z-10">
                    <h2 className="text-2xl md:text-3xl font-light mb-2">Resumen Operativo</h2>
                    <p className="text-white/60 text-sm md:text-base">Monitoreo en tiempo real del centro de psicología.</p>
                </div>
                <button className="bg-secondary text-primary-dark px-6 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold hover:bg-secondary-light transition-all shadow-md relative z-10 text-sm md:text-base w-full md:w-auto">
                    Exportar Reporte
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat) => (
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
                {/* Recent Users Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-lg md:text-xl font-light">Usuarios Recientes</h3>
                        <button className="text-sm text-primary font-medium hover:underline">Ver todos</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-gray-400 text-[10px] md:text-xs uppercase tracking-wider">
                                    <th className="px-6 md:px-8 py-4 font-medium">Nombre</th>
                                    <th className="px-6 md:px-8 py-4 font-medium hidden sm:table-cell">Rol</th>
                                    <th className="px-6 md:px-8 py-4 font-medium">Estado</th>
                                    <th className="px-6 md:px-8 py-4 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[
                                    { name: "Dr. Roberto Casas", role: "Psicólogo", status: "Activo" },
                                    { name: "Ana Maria", role: "Paciente", status: "Activo" },
                                    { name: "Carlos Sanchez", role: "Paciente", status: "Pendiente" }
                                ].map((user, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 md:px-8 py-4 md:py-5 font-medium text-gray-800 text-sm md:text-base">{user.name}</td>
                                        <td className="px-6 md:px-8 py-4 md:py-5 text-xs md:text-sm text-gray-500 hidden sm:table-cell">{user.role}</td>
                                        <td className="px-6 md:px-8 py-4 md:py-5">
                                            <span className={`px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase ${user.status === 'Activo' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 md:px-8 py-4 md:py-5 text-right">
                                            <button className="text-gray-400 hover:text-primary"><MoreHorizontal size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Reports */}
                <div className="bg-[#1a2b3b] text-white p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 md:p-8 transform group-hover:scale-110 transition-transform">
                        <ArrowUpRight className="w-8 h-8 md:w-12 md:h-12 text-primary/20" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-light mb-6 md:mb-8 text-secondary">Reporte Semanal</h3>
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                            <div>
                                <p className="text-white/50 text-xs md:text-sm">Citas Virtuales</p>
                                <p className="text-xl md:text-2xl font-bold">186</p>
                            </div>
                            <div className="text-primary text-[10px] md:text-xs font-bold">+5% vs ayer</div>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                            <div>
                                <p className="text-white/50 text-xs md:text-sm">Cancelaciones</p>
                                <p className="text-xl md:text-2xl font-bold">14</p>
                            </div>
                            <div className="text-red-400 text-[10px] md:text-xs font-bold">-2% vs ayer</div>
                        </div>
                        <button className="w-full bg-primary text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-medium mt-2 hover:bg-primary-light transition-all text-sm md:text-base">
                            Descargar PDF Completo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
