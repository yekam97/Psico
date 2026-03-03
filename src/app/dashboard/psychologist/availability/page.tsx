"use client";

import { useState } from "react";
import {
    Save,
    Clock,
    Calendar as CalendarIcon,
    CheckCircle2,
    AlertCircle
} from "lucide-react";

export default function AvailabilityPage() {
    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const [schedule, setSchedule] = useState<any>({
        Lunes: { active: true, start: "08:00", end: "17:00" },
        Martes: { active: true, start: "08:00", end: "17:00" },
        Miércoles: { active: true, start: "08:00", end: "17:00" },
        Jueves: { active: true, start: "08:00", end: "17:00" },
        Viernes: { active: true, start: "08:00", end: "15:00" },
        Sábado: { active: false, start: "09:00", end: "12:00" },
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleToggle = (day: string) => {
        setSchedule({
            ...schedule,
            [day]: { ...schedule[day], active: !schedule[day].active }
        });
    };

    const handleTimeChange = (day: string, field: "start" | "end", value: string) => {
        setSchedule({
            ...schedule,
            [day]: { ...schedule[day], [field]: value }
        });
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
    };

    return (
        <div className="max-w-3xl animate-in fade-in duration-500 space-y-8">
            <div>
                <h2 className="text-3xl font-light text-gray-800">Mi Disponibilidad</h2>
                <p className="text-gray-500 mt-2">Define tus horarios de atención para que los pacientes puedan agendar.</p>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                <div className="space-y-6">
                    {days.map((day) => (
                        <div key={day} className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 hover:bg-white border border-transparent hover:border-primary/20 transition-all group">
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${schedule[day].active ? 'bg-primary' : 'bg-gray-300'}`} onClick={() => handleToggle(day)}>
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${schedule[day].active ? 'translate-x-6' : ''}`} />
                                </div>
                                <span className={`text-lg transition-colors ${schedule[day].active ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>{day}</span>
                            </div>

                            {schedule[day].active ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100">
                                        <Clock size={16} className="text-gray-400" />
                                        <input
                                            type="time"
                                            value={schedule[day].start}
                                            onChange={(e) => handleTimeChange(day, "start", e.target.value)}
                                            className="outline-none text-sm font-medium"
                                        />
                                    </div>
                                    <span className="text-gray-300">—</span>
                                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100">
                                        <Clock size={16} className="text-gray-400" />
                                        <input
                                            type="time"
                                            value={schedule[day].end}
                                            onChange={(e) => handleTimeChange(day, "end", e.target.value)}
                                            className="outline-none text-sm font-medium"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <span className="text-sm text-gray-400 italic">No disponible</span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-tertiary-dark bg-tertiary/10 px-4 py-2 rounded-xl text-xs font-medium">
                        <AlertCircle size={14} /> Los cambios afectarán solo a futuras reservas.
                    </div>
                    <button
                        onClick={handleSave}
                        className="bg-primary text-white px-10 py-4 rounded-2xl font-medium shadow-lg hover:bg-primary-dark transition-all flex items-center gap-2"
                    >
                        {isSaving ? <CheckCircle2 size={24} className="animate-in zoom-in" /> : <Save size={20} />}
                        {isSaving ? "Guardado" : "Guardar Cambios"}
                    </button>
                </div>
            </div>

            <div className="bg-[#1a2b3b] p-8 rounded-[2.5rem] text-white flex items-center justify-between">
                <div>
                    <h4 className="text-xl font-light">Sincronización Personal</h4>
                    <p className="text-sm text-white/50 mt-1">Vincula tu Google Calendar para bloquear horarios personales.</p>
                </div>
                <button className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl transition-all border border-white/10 text-sm font-medium">
                    Conectar Calendar
                </button>
            </div>
        </div>
    );
}
