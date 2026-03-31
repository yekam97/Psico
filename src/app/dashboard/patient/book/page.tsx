"use client";

import { useState } from "react";
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    Video,
    MapPin,
    CheckCircle2,
    Search
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function BookAppointmentPage() {
    const [step, setStep] = useState(1);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [modality, setModality] = useState<"VIRTUAL" | "IN_PERSON">("VIRTUAL");
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const router = useRouter();

    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const timeSlots = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "03:00 PM", "04:00 PM"];

    const fetchPsychologists = async () => {
        try {
            const response = await axios.get("/api/patient/psychologists");
            setDoctors(response.data);
        } catch (error) {
            console.error("Error fetching psychologists:", error);
            toast.error("Error al cargar psicólogos asignados");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPsychologists();
    }, []);

    const handleNext = (doc: any) => {
        setSelectedDoc(doc);
        setStep(2);
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8">
                <ArrowLeft size={20} /> Volver al Resumen
            </Link>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 h-1 bg-primary/20 w-full">
                    <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {step === 1 && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-light text-gray-800">Selecciona tu Psicólogo</h2>
                            <p className="text-gray-500 mt-2">Busca el profesional que mejor se adapte a tus necesidades.</p>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por especialidad o nombre..."
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {loading ? (
                                <div className="col-span-full flex justify-center py-20">
                                    <Loader2 className="animate-spin text-primary" size={40} />
                                </div>
                            ) : doctors.length === 0 ? (
                                <div className="col-span-full text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                                    <p className="text-gray-500">No tienes psicólogos asignados actualmente.</p>
                                    <p className="text-xs text-gray-400 mt-2">Contacta con administración para que te asignen un profesional.</p>
                                </div>
                            ) : (
                                doctors.map((doc) => (
                                    <div
                                        key={doc.id}
                                        onClick={() => handleNext(doc)}
                                        className="p-6 rounded-3xl border border-gray-100 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 bg-sage/20 rounded-2xl flex items-center justify-center text-primary font-bold uppercase">
                                                {doc.name.charAt(0)}
                                            </div>
                                            <span className="text-xs font-bold text-sage">⭐ {doc.rating}</span>
                                        </div>
                                        <h4 className="font-semibold text-gray-800">{doc.name}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{doc.specialty}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-light text-gray-800">Horario y Modalidad</h2>
                            <p className="text-gray-500 mt-2">Sesión con <strong>{selectedDoc?.name}</strong></p>
                        </div>

                        <div className="flex gap-4">
                            {(["VIRTUAL", "IN_PERSON"] as const).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setModality(m)}
                                    className={`flex-1 p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${modality === m ? "bg-primary text-white border-primary" : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-white"
                                        }`}
                                >
                                    {m === "VIRTUAL" ? <Video /> : <MapPin />}
                                    <span className="font-medium">{m === "VIRTUAL" ? "Virtual (Google Meet)" : "Presencial (En Clínica)"}</span>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700">Horarios Disponibles para hoy, {new Date().toLocaleDateString()}</h4>
                            <div className="grid grid-cols-3 gap-3">
                                {timeSlots.map((time) => (
                                    <button
                                        key={time}
                                        type="button"
                                        onClick={() => setSelectedTime(time)}
                                        className={`py-3 rounded-xl border transition-all text-sm font-medium ${selectedTime === time
                                                ? 'border-primary text-primary bg-primary/5'
                                                : 'border-gray-100 hover:border-primary hover:text-primary bg-gray-50 hover:bg-white'
                                            }`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            disabled={submitting || !selectedTime}
                            onClick={async () => {
                                if (!selectedTime) {
                                    toast.error("Por favor selecciona un horario");
                                    return;
                                }
                                setSubmitting(true);
                                try {
                                    // Convert "09:00 AM" format to 24h
                                    const [timePart, period] = selectedTime.split(' ');
                                    let [hours, minutes] = timePart.split(':').map(Number);
                                    if (period === 'PM' && hours !== 12) hours += 12;
                                    if (period === 'AM' && hours === 12) hours = 0;
                                    const time24 = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                                    await axios.post("/api/patient/appointments", {
                                        psychologistId: selectedDoc.id,
                                        startTime: `${selectedDate}T${time24}:00`,
                                        type: modality,
                                        notes: "Cita agendada por el paciente"
                                    });
                                    setStep(3);
                                } catch (error: any) {
                                    toast.error(error.response?.data?.error || "Error al agendar cita");
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                            className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            {submitting && <Loader2 className="animate-spin" size={20} />}
                            Confirmar Cita
                        </button>

                        <button onClick={() => setStep(1)} className="text-sm text-primary hover:underline font-medium block mx-auto">Volver a Profesionales</button>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center py-12 space-y-6">
                        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 scale-up-center">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-3xl font-light text-gray-800">¡Cita Programada!</h2>
                        <div className="bg-gray-50 p-6 rounded-3xl max-w-sm mx-auto text-left">
                            <p className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wider">Detalles de la Cita</p>
                            <p className="font-bold text-gray-800">{selectedDoc?.name}</p>
                            <p className="text-sm text-primary font-medium mt-1">Hoy, 09:00 AM</p>
                            <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                                {modality === 'VIRTUAL' ? <Video size={14} /> : <MapPin size={14} />}
                                {modality === 'VIRTUAL' ? 'Virtual (Link enviado por Email)' : 'Presencial (Sede Centro)'}
                            </p>
                        </div>
                        <div className="pt-8">
                            <button
                                onClick={() => router.push("/dashboard/patient")}
                                className="bg-primary text-white px-8 py-4 rounded-2xl font-medium shadow-lg hover:bg-primary-dark transition-all"
                            >
                                Ir a mis citas
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .scale-up-center {
          animation: scale-up-center 0.4s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
        }
        @keyframes scale-up-center {
          0% { transform: scale(0.5); }
          100% { transform: scale(1); }
        }
      `}</style>
        </div >
    );
}
