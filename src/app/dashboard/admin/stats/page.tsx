"use client";

import {
    TrendingUp,
    Users,
    Calendar as CalendarIcon,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle,
    XCircle
} from "lucide-react";

export default function AdminStatsPage() {
    const stats = [
        { label: "Ocupación Total", value: "84%", icon: <TrendingUp className="text-secondary" />, trend: "+12%", color: "bg-secondary/10" },
        { label: "Pacientes Nuevos", value: "48", icon: <Users className="text-tertiary" />, trend: "+5%", color: "bg-tertiary/10" },
        { label: "Citas del Mes", value: "312", icon: <CalendarIcon className="text-primary" />, trend: "-2%", color: "bg-primary/5" },
        { label: "Ingresos (Est.)", value: "$12.4M", icon: <DollarSign className="text-secondary-dark" />, trend: "+18%", color: "bg-secondary/10" },
    ];

    const chartData = [
        { day: "Lun", value: 65 },
        { day: "Mar", value: 45 },
        { day: "Mie", value: 85 },
        { day: "Jue", value: 35 },
        { day: "Vie", value: 95 },
        { day: "Sab", value: 55 },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div>
                <h2 className="text-3xl font-light text-gray-800">Estadísticas Detalladas</h2>
                <p className="text-gray-500 mt-1">Análisis de rendimiento y crecimiento del centro psicológico.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className={`w-14 h-14 ${s.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            {s.icon}
                        </div>
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{s.label}</p>
                        <div className="flex items-baseline justify-between mt-2">
                            <h3 className="text-3xl font-bold text-gray-800">{s.value}</h3>
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${s.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                }`}>
                                {s.trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {s.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Performance Chart Simulation */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-medium text-gray-800">Demanda Semanal</h3>
                        <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm text-gray-500 outline-none">
                            <option>Última Semana</option>
                            <option>Último Mes</option>
                        </select>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-4 px-4">
                        {chartData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                <div className="relative w-full">
                                    <div
                                        className="w-full bg-primary/20 rounded-t-2xl group-hover:bg-primary transition-all duration-500 relative"
                                        style={{ height: `${d.value}%` }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {d.value}%
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-gray-400">{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Appointment Status Pie (Simulation) */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                    <h3 className="text-xl font-medium text-gray-800">Estado de Citas</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-500"><CheckCircle size={16} /></div>
                                <span className="text-sm text-gray-600 font-medium">Completadas</span>
                            </div>
                            <span className="text-sm font-bold">245</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary"><Clock size={16} /></div>
                                <span className="text-sm text-gray-600 font-medium">Pendientes</span>
                            </div>
                            <span className="text-sm font-bold">52</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-500"><XCircle size={16} /></div>
                                <span className="text-sm text-gray-600 font-medium">Canceladas</span>
                            </div>
                            <span className="text-sm font-bold">15</span>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-gray-50">
                        <p className="text-xs text-gray-400 italic">
                            * Datos actualizados en tiempo real basados en la actividad del sistema.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
