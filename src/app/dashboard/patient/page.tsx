import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Video,
    MapPin,
    Clock,
    AlertCircle,
    Plus,
    Ticket,
    Loader2
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { canCancelAppointment } from "@/lib/appointment-utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function PatientDashboard() {
    const { data: session } = useSession();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get("/api/patient/dashboard");
            setData(response.data);
        } catch (error) {
            console.error("Error fetching patient dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-40">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    const appointments = data?.appointments || [];
    const balance = data?.therapyBalance || 0;

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
                        {appointments.length === 0 ? (
                            <div className="bg-white p-12 rounded-[2rem] border border-gray-100 text-center text-gray-400">
                                No tienes citas próximas programadas.
                            </div>
                        ) : (
                            appointments.map((apt: any) => {
                                const startTime = new Date(apt.startTime);
                                const cancellable = canCancelAppointment(startTime);

                                return (
                                    <div key={apt.id} className="bg-white p-5 md:p-6 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-14 h-14 md:w-16 md:h-16 bg-sage/10 rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-sage-dark shrink-0">
                                                    <span className="text-[10px] md:text-xs font-bold uppercase">{format(startTime, 'MMM', { locale: es })}</span>
                                                    <span className="text-lg md:text-xl font-bold">{format(startTime, 'd')}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-semibold text-gray-800 text-sm md:text-base truncate">{apt.psychologist.user.name}</h4>
                                                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1 text-[10px] md:text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" /> {format(startTime, 'HH:mm')}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            {apt.type === 'VIRTUAL' ? <Video className="w-3 h-3 md:w-3.5 md:h-3.5" /> : <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                                                            {apt.type === 'VIRTUAL' ? 'Virtual' : 'Presencial'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 md:gap-3">
                                                {apt.type === 'VIRTUAL' && apt.meetingLink && (
                                                    <a
                                                        href={apt.meetingLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 md:flex-none text-center px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs md:text-sm font-medium hover:bg-primary hover:text-white transition-all"
                                                    >
                                                        Enlace Meet
                                                    </a>
                                                )}
                                                <span className="px-4 py-2 bg-gray-50 text-gray-400 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center">
                                                    {apt.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Info Column */}
                <div className="space-y-6 order-first lg:order-last">
                    {/* THERAPY BALANCE CARD */}
                    <div className="bg-[#1a2b3b] p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 transform group-hover:scale-110 transition-transform opacity-10">
                            <Ticket size={80} />
                        </div>
                        <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Sesiones Disponibles</h4>
                        <div className="flex items-end gap-2">
                            <span className="text-6xl font-bold font-mono">{balance}</span>
                            <span className="text-secondary font-bold text-lg mb-2">RESTANTES</span>
                        </div>
                        <p className="text-white/40 text-xs mt-6 leading-relaxed">
                            Recuerda que estas sesiones pueden ser utilizadas tanto en modalidad virtual como presencial.
                        </p>
                    </div>

                    <div className="bg-primary/5 p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-primary/10">
                        <h4 className="text-base md:text-lg font-medium text-primary-dark mb-4 flex items-center gap-2">
                            <AlertCircle className="w-4.5 h-4.5 md:w-5 md:h-5" /> Importante
                        </h4>
                        <ul className="space-y-3 text-xs md:text-sm text-gray-600">
                            <li className="flex gap-2">
                                <span className="text-primary">•</span> Cancelaciones permitidas hasta 12h antes.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary">•</span> Las sesiones se descuentan una vez completadas.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
