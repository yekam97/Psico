"use client";

import { useState, useEffect } from "react";
import {
    Calendar,
    Clock,
    User,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Lightbulb,
    Loader2,
    Video,
    MapPin,
    CalendarDays
} from "lucide-react";
import axios from "axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const WELLBEING_TIPS = [
    "La autocompasión es el primer paso hacia la sanación. Trátate con la misma amabilidad que tratarías a un buen amigo.",
    "Un pequeño progreso cada día suma grandes resultados. No subestimes el poder de la constancia.",
    "Practica la respiración consciente durante 5 minutos hoy. Tu mente lo agradecerá.",
    "El descanso no es un premio, es una necesidad biológica y emocional. Permítete desconectar.",
    "Validar tus emociones es más importante que intentar 'arreglarlas' de inmediato."
];

export default function PsychologistDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tipOfDay, setTipOfDay] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState("");

    useEffect(() => {
        fetchDashboardData();
        setTipOfDay(WELLBEING_TIPS[Math.floor(Math.random() * WELLBEING_TIPS.length)]);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get("/api/psychologist/appointments");
            setData(response.data);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error("Error al cargar la agenda");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: string, reason?: string) => {
        const promise = axios.patch("/api/appointments/status", {
            id,
            status,
            cancellationReason: reason
        });

        toast.promise(promise, {
            loading: 'Actualizando cita...',
            success: () => {
                fetchDashboardData();
                return status === 'COMPLETED' ? 'Sesión completada y descontada' : 'Cita cancelada correctamente';
            },
            error: (err) => err.response?.data?.error || "Error al actualizar la cita"
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-40">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl animate-in fade-in duration-500 pb-20">
            {/* Header & Tip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="md:col-span-2">
                    <h2 className="text-4xl font-light text-gray-800">Hola, {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}</h2>
                    <p className="text-gray-500 mt-2 text-lg">Tienes {data?.daily?.length || 0} sesiones programadas para hoy.</p>
                </div>
                <div className="bg-secondary/10 p-8 rounded-[2.5rem] relative overflow-hidden group border border-secondary/20">
                    <div className="absolute top-4 right-4 text-secondary opacity-20">
                        <Lightbulb size={40} />
                    </div>
                    <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">Tip de Bienestar</h4>
                    <p className="text-gray-700 text-sm italic font-medium leading-relaxed">"{tipOfDay}"</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Daily Agenda */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            <CalendarDays size={24} />
                        </div>
                        <h3 className="text-2xl font-light text-gray-800">Agenda de Hoy</h3>
                    </div>

                    {data?.daily?.length === 0 ? (
                        <div className="bg-white p-12 rounded-[3rem] border border-gray-100 text-center">
                            <Calendar className="mx-auto text-gray-200 mb-4" size={48} />
                            <p className="text-gray-400">No tienes citas programadas para hoy.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data?.daily?.map((appt: any) => (
                                <div key={appt.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex gap-6">
                                            <div className="flex flex-col items-center justify-center min-w-[70px] bg-gray-50 rounded-2xl p-3 h-fit">
                                                <span className="text-xs font-bold text-gray-400 uppercase">{format(new Date(appt.startTime), 'HH:mm')}</span>
                                                <div className="w-1 h-8 bg-primary/20 rounded-full my-1"></div>
                                                <span className="text-xs font-bold text-gray-400 uppercase">{format(new Date(appt.endTime), 'HH:mm')}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-xl font-bold text-gray-800">{appt.patient.user.name}</h4>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${appt.type === 'VIRTUAL' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'
                                                        }`}>
                                                        {appt.type === 'VIRTUAL' ? <Video size={10} className="inline mr-1" /> : <MapPin size={10} className="inline mr-1" />}
                                                        {appt.type}
                                                    </span>
                                                </div>
                                                <p className="text-gray-400 text-sm mb-4">{appt.patient.user.email}</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                        Saldo: <span className="text-primary">{appt.patient.therapyInventory?.remaining || 0} sesiones</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {appt.status === 'SCHEDULED' ? (
                                                <>
                                                    <button
                                                        disabled={updatingStatus === appt.id}
                                                        onClick={() => handleStatusUpdate(appt.id, 'COMPLETED')}
                                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-4 rounded-2xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-200"
                                                    >
                                                        {updatingStatus === appt.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                                        Finalizar
                                                    </button>
                                                    <button
                                                        disabled={updatingStatus === appt.id}
                                                        onClick={() => {
                                                            const reason = prompt("Indique el motivo de la cancelación:");
                                                            if (reason) handleStatusUpdate(appt.id, 'CANCELLED', reason);
                                                        }}
                                                        className="p-4 rounded-2xl bg-red-50 text-red-400 hover:bg-red-400 hover:text-white transition-all border border-red-100"
                                                    >
                                                        <XCircle size={22} />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest ${appt.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'
                                                    }`}>
                                                    {appt.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming / Side Section */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
                            <Clock size={24} />
                        </div>
                        <h3 className="text-2xl font-light text-gray-800">Próximas Sesiones</h3>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm divide-y divide-gray-50">
                        {data?.upcoming?.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">Sin sesiones próximas.</p>
                        ) : (
                            data?.upcoming?.map((appt: any) => (
                                <div key={appt.id} className="py-6 first:pt-0 last:pb-0 group">
                                    <div className="flex items-start gap-4">
                                        <div className="min-w-[50px] text-center">
                                            <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">{format(new Date(appt.startTime), 'MMM', { locale: es })}</p>
                                            <p className="text-2xl font-bold text-gray-800 leading-none">{format(new Date(appt.startTime), 'd')}</p>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800 group-hover:text-primary transition-colors cursor-pointer flex justify-between items-center">
                                                {appt.patient.user.name}
                                                <ChevronRight size={14} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-gray-400 font-medium">#{appt.type}</span>
                                                <span className="text-[10px] text-primary font-bold">{format(new Date(appt.startTime), 'HH:mm')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

