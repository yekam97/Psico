"use client";

import { useState } from "react";
import {
    Users,
    FileText,
    Clock,
    Search,
    User,
    ChevronRight,
    MoreVertical,
    Calendar as CalendarIcon,
    History,
    Plus,
    Save,
    Check
} from "lucide-react";

export default function PatientsListPage() {
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [note, setNote] = useState("");
    const [saved, setSaved] = useState(false);

    const patients = [
        { id: "p1", name: "Juan Pérez", lastSession: "2026-02-28", status: "Activo", history: "Evolución positiva, manejo de ansiedad..." },
        { id: "p2", name: "Maria Garcia", lastSession: "2026-03-01", status: "Activo", history: "Postulado para revisión de diagnóstico..." },
        { id: "p3", name: "Carlos Sanchez", lastSession: "2026-02-15", status: "Inactivo", history: "Finalizó proceso de duelo." },
    ];

    const handleSaveNote = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {/* Patient List Sidebar */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-[700px]">
                <div className="p-8 border-b border-gray-50 space-y-4">
                    <h3 className="text-xl font-light">Mis Pacientes</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 outline-none text-sm transition-all"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {patients.map((p) => (
                        <div
                            key={p.id}
                            onClick={() => setSelectedPatient(p)}
                            className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between group ${selectedPatient?.id === p.id ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-gray-50"
                                }`}
                        >
                            <div>
                                <p className="font-medium text-gray-800">{p.name}</p>
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <Clock size={10} /> Última: {p.lastSession}
                                </p>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${p.status === 'Activo' ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'
                                    }`}>
                                    {p.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Clinical Notes Area */}
            <div className="lg:col-span-2 space-y-6">
                {selectedPatient ? (
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm h-full space-y-8 animate-in slide-in-from-right-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-light text-gray-800">{selectedPatient.name}</h2>
                                <div className="flex gap-4 mt-2">
                                    <span className="text-sm text-gray-400 flex items-center gap-1">
                                        <History size={14} /> ID: {selectedPatient.id}
                                    </span>
                                    <span className="text-sm text-gray-400 flex items-center gap-1">
                                        <Users size={14} /> Paciente desde Enero 2026
                                    </span>
                                    <button className="text-gray-400 hover:text-secondary transition-colors p-2">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>
                            <button className="flex items-center gap-2 text-secondary hover:underline font-medium">
                                <FileText size={20} /> Ver Historial Completo
                            </button>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Plus size={16} /> Nota de evolución para sesión hoy
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Escribe aquí las observaciones privadas de la sesión..."
                                className="w-full h-48 p-6 bg-gray-50 rounded-[2rem] border border-transparent focus:bg-white focus:border-primary/20 outline-none transition-all resize-none shadow-inner"
                            />
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-400 italic">
                                    Las notas clínicas son cifradas y solo accesibles por ti.
                                </p>
                                <button
                                    onClick={handleSaveNote}
                                    className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-medium transition-all ${saved ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-primary-dark"
                                        }`}
                                >
                                    {saved ? <Check size={20} /> : <Save size={20} />}
                                    {saved ? "Guardado" : "Guardar Nota"}
                                </button>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-50 space-y-6">
                            <h3 className="text-lg font-medium text-gray-700">Resumen de Antecedentes</h3>
                            <div className="bg-sage/5 p-6 rounded-3xl text-sm text-gray-600 leading-relaxed italic">
                                "{selectedPatient.history}"
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                        <FileText size={64} className="opacity-20" />
                        <p>Selecciona un paciente para ver su historia clínica</p>
                    </div>
                )}
            </div>
        </div>
    );
}
