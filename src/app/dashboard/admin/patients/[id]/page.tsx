"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, Loader2, Ticket } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useBranding } from "@/components/providers/BrandingProvider";
import { sessionLabel } from "@/lib/specialty";
import ClinicalDocumentationPanel from "@/components/clinical/ClinicalDocumentationPanel";

interface PatientDetailProps {
    params: Promise<{ id: string }>;
}

// Lets an ADMIN read/write a patient's clinical documentation on behalf of
// their assigned professional(s) — the only way to record anything for a
// patient at all when the center's plan has no PORTAL_ACCESS (the
// professional record exists but can never log in to do it themselves).
export default function AdminPatientDetailPage({ params }: PatientDetailProps) {
    const { id } = use(params);
    const { branding } = useBranding();
    const [loading, setLoading] = useState(true);
    const [patient, setPatient] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        axios.get("/api/admin/users")
            .then((res) => {
                const found = res.data.find((u: any) => u.profile?.id === id);
                setPatient(found || null);
            })
            .catch((error) => console.error("Error fetching patient:", error))
            .finally(() => setLoading(false));
    }, [id]);

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

    const assignedProfessionals = (patient.profile?.assignedPsychologists || []).map((a: any) => ({
        id: a.psychologistId,
        name: a.psychologist.user.name
    }));

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
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm text-center">
                        <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary text-3xl font-bold mx-auto mb-6">
                            {patient.name?.charAt(0)}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-1">{patient.name}</h3>
                        <p className="text-gray-400 text-sm mb-6 uppercase tracking-widest font-medium">Paciente</p>

                        <div className="space-y-3 text-left bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-3 text-gray-600">
                                <Ticket size={16} className="text-primary" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-gray-400">{sessionLabel(branding.specialty)} Restantes</span>
                                    <span className="font-bold text-lg">{patient.profile?.therapyInventory?.remaining ?? 0}</span>
                                </div>
                            </div>
                            {assignedProfessionals.length > 0 && (
                                <div className="text-xs text-gray-500">
                                    Asignado a: {assignedProfessionals.map((p: any) => p.name).join(", ")}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <ClinicalDocumentationPanel
                        patientId={id}
                        specialty={branding.specialty}
                        modules={branding.modules}
                        assignedProfessionals={assignedProfessionals}
                    />
                </div>
            </div>
        </div>
    );
}
