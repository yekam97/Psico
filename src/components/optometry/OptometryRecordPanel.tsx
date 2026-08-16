"use client";

import { useState } from "react";
import { Loader2, Eye } from "lucide-react";

export interface OptometryRecordEntry {
    id: string;
    createdAt: string;
    doctor: { user: { name: string } };
    odSphere: string | null;
    odCylinder: string | null;
    odAxis: string | null;
    odVisualAcuity: string | null;
    osSphere: string | null;
    osCylinder: string | null;
    osAxis: string | null;
    osVisualAcuity: string | null;
    notes: string | null;
}

interface OptometryRecordPanelProps {
    records: OptometryRecordEntry[];
    onAddRecord: (data: Record<string, string>) => Promise<void>;
}

const EMPTY_FORM = {
    odSphere: "", odCylinder: "", odAxis: "", odVisualAcuity: "",
    osSphere: "", osCylinder: "", osAxis: "", osVisualAcuity: "",
    notes: ""
};

function EyeColumn({ label, prefix, form, setForm }: { label: string; prefix: "od" | "os"; form: typeof EMPTY_FORM; setForm: (f: typeof EMPTY_FORM) => void }) {
    const field = (key: string) => `${prefix}${key}` as keyof typeof EMPTY_FORM;
    return (
        <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">{label}</p>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Esfera</label>
                    <input type="text" placeholder="-1.25" value={form[field("Sphere")]} onChange={(e) => setForm({ ...form, [field("Sphere")]: e.target.value })}
                        className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary/40" />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Cilindro</label>
                    <input type="text" placeholder="-0.50" value={form[field("Cylinder")]} onChange={(e) => setForm({ ...form, [field("Cylinder")]: e.target.value })}
                        className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary/40" />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Eje</label>
                    <input type="text" placeholder="90°" value={form[field("Axis")]} onChange={(e) => setForm({ ...form, [field("Axis")]: e.target.value })}
                        className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary/40" />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Agudeza Visual</label>
                    <input type="text" placeholder="20/20" value={form[field("VisualAcuity")]} onChange={(e) => setForm({ ...form, [field("VisualAcuity")]: e.target.value })}
                        className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary/40" />
                </div>
            </div>
        </div>
    );
}

export default function OptometryRecordPanel({ records, onAddRecord }: OptometryRecordPanelProps) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onAddRecord(form);
            setForm(EMPTY_FORM);
        } finally {
            setSubmitting(false);
        }
    };

    const hasAnyValue = Object.entries(form).some(([k, v]) => k !== "notes" && v.trim());

    return (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <Eye size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Registro de Optometría</h3>
                    <p className="text-sm text-gray-500 mt-1">Fórmula de graduación de esta consulta, ojo derecho (OD) e izquierdo (OS).</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EyeColumn label="Ojo Derecho (OD)" prefix="od" form={form} setForm={setForm} />
                    <EyeColumn label="Ojo Izquierdo (OS)" prefix="os" form={form} setForm={setForm} />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Notas adicionales</label>
                    <textarea
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder="Observaciones de la consulta..."
                        className="w-full bg-gray-50 border border-transparent rounded-2xl text-gray-900 px-6 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all min-h-[100px] resize-none text-sm"
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        disabled={submitting || (!hasAnyValue && !form.notes.trim())}
                        type="submit"
                        className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {submitting && <Loader2 size={18} className="animate-spin" />}
                        Guardar Registro
                    </button>
                </div>
            </form>

            <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Historial de consultas</h4>
                {records.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-4 text-center">Sin registros todavía.</p>
                ) : (
                    <div className="space-y-3">
                        {records.map((r) => (
                            <div key={r.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        {new Date(r.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-full uppercase">{r.doctor.user.name}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                                    <p><span className="text-gray-400">OD:</span> {[r.odSphere, r.odCylinder, r.odAxis].filter(Boolean).join(" / ") || "—"} {r.odVisualAcuity && `(AV ${r.odVisualAcuity})`}</p>
                                    <p><span className="text-gray-400">OS:</span> {[r.osSphere, r.osCylinder, r.osAxis].filter(Boolean).join(" / ") || "—"} {r.osVisualAcuity && `(AV ${r.osVisualAcuity})`}</p>
                                </div>
                                {r.notes && <p className="text-sm text-gray-600 italic pt-1 border-t border-gray-100">{r.notes}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
