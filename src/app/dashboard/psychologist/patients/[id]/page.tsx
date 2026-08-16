"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, Loader2, Calendar, Ticket } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useBranding } from "@/components/providers/BrandingProvider";
import { sessionLabel } from "@/lib/specialty";
import ClinicalDocumentationPanel from "@/components/clinical/ClinicalDocumentationPanel";

interface PatientDetailProps {
    params: Promise<{ id: string }>;
}

export default function PatientDetailPage({ params }: PatientDetailProps) {
    const { id } = use(params);
    const { branding } = useBranding();
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState<any[]>([]);
    const router = useRouter();

    const patient = patients.find(p => p.id === id);

    useEffect(() => {
        axios.get("/api/psychologist/patients")
            .then((res) => setPatients(res.data))
            .catch((error) => console.error("Error fetching patients:", error))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-40">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (!patient) {
        return <div className="text-center py-20">Paciente no encontrado.</div>;
    }

    return (
        <div className="max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-400 hover:text-primary mb-8 transition-colors group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span>Volver al listado</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Patient Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm text-center">
                        <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary dark:text-primary-light text-3xl font-bold mx-auto mb-6">
                            {patient.name?.charAt(0)}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">{patient.name}</h3>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mb-6 uppercase tracking-widest font-medium">Paciente</p>

                        <div className="space-y-3 text-left bg-gray-50 dark:bg-[#2a2a2a] p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                <Ticket size={16} className="text-primary" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-gray-400">{sessionLabel(branding.specialty)} Restantes</span>
                                    <span className="font-bold text-lg">{patient.therapyBalance}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                <Calendar size={16} className="text-secondary" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-gray-400">Última Cita</span>
                                    <span className="font-semibold text-xs">
                                        {patient.lastAppointment ? format(new Date(patient.lastAppointment.startTime), 'd MMM yyyy', { locale: es }) : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clinical Documentation Section — odontogram/optometry record for
                    specialties whose plan includes it, free-text notes otherwise */}
                <div className="lg:col-span-2 space-y-8">
                    <ClinicalDocumentationPanel patientId={id} specialty={branding.specialty} modules={branding.modules} />
                </div>
            </div>
        </div>
    );
}
