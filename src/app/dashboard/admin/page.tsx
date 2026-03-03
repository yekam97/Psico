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
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-primary text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                <div className="relative z-10">
                    <h2 className="text-3xl font-light mb-2">Resumen Operativo</h2>
                    <p className="text-white/60">Monitoreo en tiempo real del centro de psicología.</p>
                </div>
                <button className="bg-secondary text-primary-dark px-8 py-3 rounded-2xl font-bold hover:bg-secondary-light transition-all shadow-md relative z-10">
                    Exportar Reporte
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-6 group hover:border-secondary/20 transition-all">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon size={32} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Users Table */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-xl font-light">Usuarios Recientes</h3>
                        <button className="text-sm text-primary font-medium hover:underline">Ver todos</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="px-8 py-4 font-medium">Nombre</th>
                                    <th className="px-8 py-4 font-medium">Rol</th>
                                    <th className="px-8 py-4 font-medium">Estado</th>
                                    <th className="px-8 py-4 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[
                                    { name: "Dr. Roberto Casas", role: "Psicólogo", status: "Activo" },
                                    { name: "Ana Maria", role: "Paciente", status: "Activo" },
                                    { name: "Carlos Sanchez", role: "Paciente", status: "Pendiente" }
                                ].map((user, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 font-medium text-gray-800">{user.name}</td>
                                        <td className="px-8 py-5 text-sm text-gray-500">{user.role}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${user.status === 'Activo' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="text-gray-400 hover:text-primary"><MoreHorizontal size={20} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Reports */}
                <div className="bg-[#1a2b3b] text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 transform group-hover:scale-110 transition-transform">
                        <ArrowUpRight size={48} className="text-primary/20" />
                    </div>
                    <h3 className="text-2xl font-light mb-8">Reporte Semanal</h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                            <div>
                                <p className="text-white/50 text-sm">Citas Virtuales</p>
                                <p className="text-2xl font-bold">186</p>
                            </div>
                            <div className="text-primary text-xs font-bold">+5% vs ayer</div>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                            <div>
                                <p className="text-white/50 text-sm">Cancelaciones</p>
                                <p className="text-2xl font-bold">14</p>
                            </div>
                            <div className="text-red-400 text-xs font-bold">-2% vs ayer</div>
                        </div>
                        <button className="w-full bg-primary text-white py-4 rounded-2xl font-medium mt-4 hover:bg-primary-light transition-all">
                            Descargar PDF Completo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
