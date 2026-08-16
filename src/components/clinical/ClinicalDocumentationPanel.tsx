"use client";

import { useState, useEffect } from "react";
import { StickyNote, Send, History, Trash2, Loader2, Lock } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { isDentalSpecialty, isOptometrySpecialty, hasModule, PLAN_MODULES } from "@/lib/specialty";
import Odontogram, { ToothRecordEntry } from "@/components/dental/Odontogram";
import OptometryRecordPanel, { OptometryRecordEntry } from "@/components/optometry/OptometryRecordPanel";

interface AssignedProfessional {
    id: string;
    name: string;
}

interface ClinicalDocumentationPanelProps {
    patientId: string;
    specialty: string | null;
    modules: string[] | null;
    /** Only relevant when viewing as ADMIN — who this entry gets attributed to. */
    assignedProfessionals?: AssignedProfessional[];
}

export default function ClinicalDocumentationPanel({ patientId, specialty, modules, assignedProfessionals }: ClinicalDocumentationPanelProps) {
    const isDental = isDentalSpecialty(specialty);
    const isOptometry = isOptometrySpecialty(specialty);
    const showOdontogram = isDental && hasModule(modules, PLAN_MODULES.ODONTOGRAM);
    const showOptometryRecord = isOptometry && hasModule(modules, PLAN_MODULES.OPTOMETRY_RECORD);

    // Admin needs to say which assigned professional an entry is written on
    // behalf of; a lone professional viewing their own patient never needs
    // this (the API infers it from their session).
    const needsAttribution = !!assignedProfessionals;
    const [attributedTo, setAttributedTo] = useState(assignedProfessionals?.[0]?.id || "");

    const [notes, setNotes] = useState<any[]>([]);
    const [toothRecords, setToothRecords] = useState<ToothRecordEntry[]>([]);
    const [optometryRecords, setOptometryRecords] = useState<OptometryRecordEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const endpoint = showOdontogram
        ? `/api/professional/tooth-records/${patientId}`
        : showOptometryRecord
            ? `/api/professional/optometry-records/${patientId}`
            : `/api/psychologist/notes/${patientId}`;

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(endpoint);
            if (showOdontogram) setToothRecords(res.data);
            else if (showOptometryRecord) setOptometryRecords(res.data);
            else setNotes(res.data);
        } catch (error) {
            console.error("Error fetching clinical documentation:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId, showOdontogram, showOptometryRecord]);

    const attributionPayload = needsAttribution ? { psychologistId: attributedTo } : {};

    const handleAddToothRecord = async (toothNumber: number, procedure: string) => {
        try {
            await axios.post(endpoint, { toothNumber, procedure, ...attributionPayload });
            toast.success("Procedimiento registrado");
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al guardar el procedimiento");
        }
    };

    const handleAddOptometryRecord = async (data: Record<string, string>) => {
        try {
            await axios.post(endpoint, { ...data, ...attributionPayload });
            toast.success("Registro guardado");
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al guardar el registro");
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        setSubmitting(true);
        try {
            await axios.post(endpoint, { content: newNote, ...attributionPayload });
            setNewNote("");
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al guardar la nota");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!confirm("¿Está seguro de que desea eliminar esta nota? Esta acción no se puede deshacer.")) return;
        try {
            await axios.delete(`/api/psychologist/notes/${patientId}/${noteId}`);
            toast.success("Nota eliminada correctamente");
            fetchData();
        } catch (error) {
            toast.error("Error al eliminar la nota");
        }
    };

    const attributionPicker = needsAttribution && assignedProfessionals && assignedProfessionals.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">Registrar como</label>
            {assignedProfessionals.length === 1 ? (
                <span className="text-sm font-bold text-primary">{assignedProfessionals[0].name}</span>
            ) : (
                <select
                    value={attributedTo}
                    onChange={(e) => setAttributedTo(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary/40"
                >
                    {assignedProfessionals.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (needsAttribution && (!assignedProfessionals || assignedProfessionals.length === 0)) {
        return (
            <div className="bg-white p-8 rounded-[3rem] border border-dashed border-gray-200 text-center text-gray-400">
                Este paciente no tiene {isDental ? "un odontólogo" : isOptometry ? "un optómetra" : "un profesional"} asignado todavía.
            </div>
        );
    }

    if (showOdontogram) {
        return (
            <div className="space-y-6">
                {attributionPicker}
                <Odontogram records={toothRecords} onAddRecord={handleAddToothRecord} />
            </div>
        );
    }

    if (showOptometryRecord) {
        return (
            <div className="space-y-6">
                {attributionPicker}
                <OptometryRecordPanel records={optometryRecords} onAddRecord={handleAddOptometryRecord} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {(isDental || isOptometry) && (
                <div className="flex items-center gap-4 p-6 bg-secondary/10 border border-secondary/20 rounded-[2rem]">
                    <div className="p-3 bg-secondary/20 rounded-2xl text-secondary-dark shrink-0">
                        <Lock size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">
                            {isDental ? "El Odontograma" : "El Registro de Optometría"} no está incluido en tu plan actual
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Mientras tanto puedes seguir documentando las sesiones con notas de texto. Contacta a la plataforma para actualizar tu plan.</p>
                    </div>
                </div>
            )}
            {attributionPicker}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <StickyNote size={24} />
                </div>
                <h3 className="text-2xl font-light text-gray-800 dark:text-gray-100">Historial de Notas Clínicas</h3>
            </div>

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
        </div>
    );
}
