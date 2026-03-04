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
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-light text-gray-800">Hola, {session?.user?.name || "Paciente"}</h2>
                    <p className="text-sm md:text-base text-gray-500 mt-1">Aquí puedes ver el estado de tu proceso terapéutico.</p>
                </div>
                <Link
                    href="/dashboard/patient/book"
                    className="bg-primary text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-primary-dark transition-all shadow-md group w-full sm:w-auto justify-center"
                >
                    <Plus className="group-hover:rotate-90 transition-transform" /> Nueva Cita
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Main Appointment List */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    <h3 className="text-lg md:text-xl font-light text-gray-700 flex items-center gap-2">
                        <CalendarIcon className="text-primary w-5 h-5 md:w-6 md:h-6" /> Mis Citas Programadas
                    </h3>

                    <div className="space-y-4">
                        {appointments.map((apt) => {
                            const cancellable = canCancelAppointment(apt.startTime);

                            return (
                                <div key={apt.id} className="bg-white p-5 md:p-6 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-14 h-14 md:w-16 md:h-16 bg-sage/10 rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-sage-dark shrink-0">
                                                <span className="text-[10px] md:text-xs font-bold uppercase">{apt.startTime.toLocaleDateString('es-ES', { month: 'short' })}</span>
                                                <span className="text-lg md:text-xl font-bold">{apt.startTime.getDate()}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-semibold text-gray-800 text-sm md:text-base truncate">{apt.psychologist}</h4>
                                                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1 text-[10px] md:text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" /> {apt.startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        {apt.type === 'VIRTUAL' ? <Video className="w-3 h-3 md:w-3.5 md:h-3.5" /> : <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                                                        {apt.type === 'VIRTUAL' ? 'Virtual' : 'Presencial'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 md:gap-3">
                                            {apt.type === 'VIRTUAL' && (
                                                <a
                                                    href={apt.meetLink}
                                                    target="_blank"
                                                    className="flex-1 md:flex-none text-center px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs md:text-sm font-medium hover:bg-primary hover:text-white transition-all"
                                                >
                                                    Enlace Meet
                                                </a>
                                            )}

                                            <button
                                                disabled={!cancellable}
                                                className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${cancellable
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
                <div className="space-y-6 order-first lg:order-last">
                    <div className="bg-primary/5 p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-primary/10">
                        <h4 className="text-base md:text-lg font-medium text-primary-dark mb-4 flex items-center gap-2">
                            <AlertCircle className="w-4.5 h-4.5 md:w-5 md:h-5" /> Recordatorio
                        </h4>
                        <ul className="space-y-3 text-xs md:text-sm text-gray-600">
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

                    <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[3rem] shadow-xl border border-secondary/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 opacity-50" />
                        <h1 className="text-2xl md:text-4xl font-light text-primary relative z-10">Hola, <span className="italic font-normal">{session?.user?.name?.split(' ')[0] || "Paciente"}</span></h1>
                        <p className="text-gray-500 mt-2 relative z-10 text-sm md:text-base">Es un buen día para priorizar tu bienestar mental.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
