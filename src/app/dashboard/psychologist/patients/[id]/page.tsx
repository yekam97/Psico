"use client";

import { useState, useEffect, use } from "react";
import {
    ArrowLeft,
    Loader2,
    Plus,
    Calendar,
    FileText,
    StickyNote,
    CheckCircle2,
    History,
    Ticket,
    Send,
    Trash2
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useBranding } from "@/components/providers/BrandingProvider";
import { isDentalSpecialty, hasModule } from "@/lib/specialty";
import Odontogram, { ToothRecordEntry } from "@/components/dental/Odontogram";
import { Lock } from "lucide-react";

interface PatientDetailProps {
    params: Promise<{ id: string }>;
}

export default function PatientDetailPage({ params }: PatientDetailProps) {
    const { id } = use(params);
    const { branding } = useBranding();
    const isDental = isDentalSpecialty(branding.specialty);
    const hasOdontogramModule = hasModule(branding.modules, "ODONTOGRAM");
    const showOdontogram = isDental && hasOdontogramModule;
    const [notes, setNotes] = useState<any[]>([]);
    const [toothRecords, setToothRecords] = useState<ToothRecordEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const router = useRouter();

    const patient = patients.find(p => p.id === id);

    useEffect(() => {
        fetchInitialData();
    }, [id, showOdontogram]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Fetch patients to get the current one's details
            const patientsRes = await axios.get("/api/psychologist/patients");
            setPatients(patientsRes.data);

            if (showOdontogram) {
                const toothRes = await axios.get(`/api/professional/tooth-records/${id}`);
                setToothRecords(toothRes.data);
            } else {
                const notesRes = await axios.get(`/api/psychologist/notes/${id}`);
                setNotes(notesRes.data);
            }
        } catch (error) {
            console.error("Error fetching patient detail:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToothRecord = async (toothNumber: number, procedure: string) => {
        try {
            await axios.post(`/api/professional/tooth-records/${id}`, { toothNumber, procedure });
            const toothRes = await axios.get(`/api/professional/tooth-records/${id}`);
            setToothRecords(toothRes.data);
            toast.success("Procedimiento registrado");
        } catch (error) {
            toast.error("Error al guardar el procedimiento");
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        setSubmitting(true);
        try {
            await axios.post(`/api/psychologist/notes/${id}`, { content: newNote });
            setNewNote("");
            const notesRes = await axios.get(`/api/psychologist/notes/${id}`);
            setNotes(notesRes.data);
        } catch (error) {
            toast.error("Error al guardar la nota");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!confirm("¿Está seguro de que desea eliminar esta nota? Esta acción no se puede deshacer.")) return;

        try {
            await axios.delete(`/api/psychologist/notes/${id}/${noteId}`);
            toast.success("Nota eliminada correctamente");
            // Refresh notes
            const notesRes = await axios.get(`/api/psychologist/notes/${id}`);
            setNotes(notesRes.data);
        } catch (error) {
            toast.error("Error al eliminar la nota");
        }
    };

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
                                    <span className="text-[10px] uppercase font-bold text-gray-400">Terapias Restantes</span>
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

                {/* Clinical Documentation Section — odontogram for dental/orthodontic
                    centers whose plan includes it, free-text notes for everyone else */}
                <div className="lg:col-span-2 space-y-8">
                    {showOdontogram ? (
                        <Odontogram records={toothRecords} onAddRecord={handleAddToothRecord} />
                    ) : (
                        <>
                            {isDental && (
                                <div className="flex items-center gap-4 p-6 bg-secondary/10 border border-secondary/20 rounded-[2rem]">
                                    <div className="p-3 bg-secondary/20 rounded-2xl text-secondary-dark shrink-0">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">El Odontograma no está incluido en tu plan actual</p>
                                        <p className="text-xs text-gray-500 mt-1">Mientras tanto puedes seguir documentando las sesiones con notas de texto. Contacta a la plataforma para actualizar tu plan.</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    <StickyNote size={24} />
                                </div>
                                <h3 className="text-2xl font-light text-gray-800 dark:text-gray-100">Historial de Notas Clínicas</h3>
                            </div>

                            {/* New Note Form */}
                            <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                                <form onSubmit={handleAddNote} className="space-y-4">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nueva Nota de Seguimiento</label>
                                    <textarea
                                        required
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        placeholder="Escribe aquí los detalles del progreso de la sesión..."
                                        className="w-full bg-gray-50 dark:bg-[#2a2a2a] dark:text-white border border-transparent rounded-2xl px-6 py-4 focus:bg-white dark:focus:bg-[#333] focus:border-primary/20 outline-none transition-all min-h-[120px] resize-none"
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            disabled={submitting}
                                            className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                        >
                                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                            Guardar Nota
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Notes List */}
                            <div className="space-y-4">
                                {notes.length === 0 ? (
                                    <div className="p-12 text-center text-gray-400 italic">
                                        No hay notas registradas para este paciente.
                                    </div>
                                ) : (
                                    notes.map((note) => (
                                        <div key={note.id} className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary">
                                                        <History size={14} />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                        {format(new Date(note.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-full uppercase">
                                                    {note.psychologist.user.name}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                                            <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDeleteNote(note.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                                    title="Eliminar nota"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
