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
    Send
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PatientDetailProps {
    params: Promise<{ id: string }>;
}

export default function PatientDetailPage({ params }: PatientDetailProps) {
    const { id } = use(params);
    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const router = useRouter();

    const patient = patients.find(p => p.id === id);

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Fetch patients to get the current one's details
            const patientsRes = await axios.get("/api/psychologist/patients");
            setPatients(patientsRes.data);

            // Fetch notes
            const notesRes = await axios.get(`/api/psychologist/notes/${id}`);
            setNotes(notesRes.data);
        } catch (error) {
            console.error("Error fetching patient detail:", error);
        } finally {
            setLoading(false);
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
                                    <span className="text-[10px] uppercase font-bold text-gray-400">Terapias Restantes</span>
                                    <span className="font-bold text-lg">{patient.therapyBalance}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
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

                {/* Clinical Notes Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            <StickyNote size={24} />
                        </div>
                        <h3 className="text-2xl font-light text-gray-800">Historial de Notas Clínicas</h3>
                    </div>

                    {/* New Note Form */}
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                        <form onSubmit={handleAddNote} className="space-y-4">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nueva Nota de Seguimiento</label>
                            <textarea
                                required
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Escribe aquí los detalles del progreso de la sesión..."
                                className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all min-h-[120px] resize-none"
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
                                <div key={note.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all">
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
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
