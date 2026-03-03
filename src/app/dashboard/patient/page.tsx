"use client";

import { useSession } from "next-auth/react";
import {
    Calendar as CalendarIcon,
    Video,
    MapPin,
    Clock,
    AlertCircle,
    Plus,
    Users,
    FileText,
    Search,
    User,
    ChevronRight,
    MoreVertical
} from "lucide-react";
import Link from "next/link";
import { canCancelAppointment } from "@/lib/appointment-utils";

export default function PatientDashboard() {
    const { data: session } = useSession();

    // Mock appointments for demo
    const appointments = [
        {
            id: "101",
            psychologist: "Dr. Roberto Casas",
            startTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Tomorrow
            type: "VIRTUAL",
            meetLink: "https://meet.google.com/abc-defg-hij",
            status: "SCHEDULED"
        },
        {
            id: "102",
            psychologist: "Dra. Elena Ruiz",
            startTime: new Date(new Date().getTime() + 5 * 60 * 60 * 1000), // In 5 hours (Cannot cancel)
            type: "IN_PERSON",
            status: "SCHEDULED"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-light text-gray-800">Hola, {session?.user?.name || "Paciente"}</h2>
                    <p className="text-gray-500 mt-1">Aquí puedes ver el estado de tu proceso terapéutico.</p>
                </div>
                <Link
                    href="/dashboard/patient/book"
                    className="bg-primary text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-primary-dark transition-all shadow-md group"
                >
                    <Plus className="group-hover:rotate-90 transition-transform" /> Nueva Cita
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Appointment List */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-light text-gray-700 flex items-center gap-2">
                        <CalendarIcon className="text-primary w-5 h-5" /> Mis Citas Programadas
                    </h3>

                    <div className="space-y-4">
                        {appointments.map((apt) => {
                            const cancellable = canCancelAppointment(apt.startTime);

                            return (
                                <div key={apt.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-16 h-16 bg-sage/10 rounded-2xl flex flex-col items-center justify-center text-sage-dark">
                                                <span className="text-xs font-bold uppercase">{apt.startTime.toLocaleDateString('es-ES', { month: 'short' })}</span>
                                                <span className="text-xl font-bold">{apt.startTime.getDate()}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{apt.psychologist}</h4>
                                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} /> {apt.startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        {/* Replaced Video/MapPin with generic icons or removed if not in new imports */}
                                                        {apt.type === 'VIRTUAL' ? <Users size={14} /> : <FileText size={14} />} {/* Using Users/FileText as placeholders */}
                                                        {apt.type === 'VIRTUAL' ? 'Virtual' : 'Presencial'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            {apt.type === 'VIRTUAL' && (
                                                <a
                                                    href={apt.meetLink}
                                                    target="_blank"
                                                    className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary hover:text-white transition-all"
                                                >
                                                    Enlace Meet
                                                </a>
                                            )}

                                            <button
                                                disabled={!cancellable}
                                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${cancellable
                                                    ? "border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                                                    : "bg-gray-50 text-gray-300 cursor-not-allowed"
                                                    }`}
                                                title={!cancellable ? "No se puede cancelar con menos de 12h de antelación" : ""}
                                            >
                                                {cancellable ? "Cancelar" : "No cancelable (12h)"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Info Column */}
                <div className="space-y-6">
                    <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10">
                        <h4 className="text-lg font-medium text-primary-dark mb-4 flex items-center gap-2">
                            <AlertCircle size={20} /> Recordatorio
                        </h4>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex gap-2">
                                <span className="text-primary">•</span> Las cancelaciones permitidas hasta 12 horas antes.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary">•</span> Recibirás un recordatorio por WhatsApp 1 hora antes.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary">•</span> Mantén tu cámara encendida en sesiones virtuales.
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-secondary/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                        <h1 className="text-4xl font-light text-primary relative z-10">Hola, <span className="italic font-normal">{session?.user?.name?.split(' ')[0] || "Paciente"}</span></h1>
                        <p className="text-gray-500 mt-2 relative z-10">Es un buen día para priorizar tu bienestar mental.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
