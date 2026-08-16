"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

// FDI (ISO 3950) numbering, laid out the way a dental chart is conventionally
// drawn: upper row left-to-right 18→11, 21→28; lower row left-to-right
// 48→41, 31→38.
const UPPER_ROW = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_ROW = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

export interface ToothRecordEntry {
    id: string;
    toothNumber: number;
    procedure: string;
    createdAt: string;
    doctor: { user: { name: string } };
}

interface OdontogramProps {
    records: ToothRecordEntry[];
    onAddRecord: (toothNumber: number, procedure: string) => Promise<void>;
}

function ToothButton({ number, hasRecords, onClick }: { number: number; hasRecords: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={`Diente ${number}`}
            className={`w-9 h-11 md:w-10 md:h-12 rounded-lg border-2 flex items-center justify-center text-[11px] font-bold transition-all shrink-0 ${hasRecords
                ? "bg-primary text-white border-primary shadow-md"
                : "bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary"
                }`}
        >
            {number}
        </button>
    );
}

export default function Odontogram({ records, onAddRecord }: OdontogramProps) {
    const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
    const [procedure, setProcedure] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const recordsByTooth = records.reduce<Record<number, ToothRecordEntry[]>>((acc, r) => {
        (acc[r.toothNumber] ||= []).push(r);
        return acc;
    }, {});

    const closeModal = () => {
        setSelectedTooth(null);
        setProcedure("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTooth || !procedure.trim()) return;
        setSubmitting(true);
        try {
            await onAddRecord(selectedTooth, procedure.trim());
            closeModal();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
            <div>
                <h3 className="text-xl font-bold text-gray-800">Odontograma</h3>
                <p className="text-sm text-gray-500 mt-1">Haz click en un diente para registrar el procedimiento realizado en la sesión.</p>
            </div>

            <div className="bg-rose-50/50 rounded-[2rem] p-6 md:p-10 space-y-6 overflow-x-auto">
                <div className="flex gap-1.5 md:gap-2 justify-center min-w-max mx-auto bg-rose-100/60 rounded-full px-4 py-3">
                    {UPPER_ROW.map((n) => (
                        <ToothButton key={n} number={n} hasRecords={!!recordsByTooth[n]} onClick={() => setSelectedTooth(n)} />
                    ))}
                </div>
                <div className="flex gap-1.5 md:gap-2 justify-center min-w-max mx-auto bg-rose-100/60 rounded-full px-4 py-3">
                    {LOWER_ROW.map((n) => (
                        <ToothButton key={n} number={n} hasRecords={!!recordsByTooth[n]} onClick={() => setSelectedTooth(n)} />
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Historial de procedimientos</h4>
                {records.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-4 text-center">Sin procedimientos registrados todavía.</p>
                ) : (
                    <div className="space-y-3">
                        {records.map((r) => (
                            <div key={r.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                    {r.toothNumber}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-700">{r.procedure}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(r.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                        {" · "}{r.doctor.user.name}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedTooth && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] w-full min-w-0 max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Diente {selectedTooth}</h3>
                                <p className="text-xs text-gray-500">Registrar procedimiento de esta sesión</p>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <textarea
                                autoFocus
                                required
                                className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all min-h-[120px] resize-none text-sm"
                                placeholder="Ej: Resina compuesta, cara oclusal..."
                                value={procedure}
                                onChange={(e) => setProcedure(e.target.value)}
                            />
                            <button
                                disabled={submitting || !procedure.trim()}
                                type="submit"
                                className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting && <Loader2 className="animate-spin" size={20} />}
                                Guardar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
