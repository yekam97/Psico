"use client";

import { useState, useEffect } from "react";
import { Plus, X, Loader2, Trash2, Ticket } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface PlanRow {
    id: string;
    name: string;
    maxPatients: number | null;
    maxProfessionals: number | null;
    modules: string[];
    _count: { companies: number };
}

const AVAILABLE_MODULES = [
    { key: "ODONTOGRAM", label: "Odontograma" },
];

export default function SuperAdminPlansPage() {
    const [plans, setPlans] = useState<PlanRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ name: "", maxPatients: "", maxProfessionals: "", modules: [] as string[] });

    const fetchPlans = async () => {
        try {
            const res = await axios.get("/api/super-admin/plans");
            setPlans(res.data);
        } catch {
            toast.error("Error al cargar planes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const toggleModule = (key: string) => {
        setForm((prev) => ({
            ...prev,
            modules: prev.modules.includes(key) ? prev.modules.filter((m) => m !== key) : [...prev.modules, key]
        }));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post("/api/super-admin/plans", form);
            toast.success("Plan creado correctamente");
            setIsModalOpen(false);
            setForm({ name: "", maxPatients: "", maxProfessionals: "", modules: [] });
            fetchPlans();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al crear el plan");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este plan? Solo se puede si ningún centro lo está usando.")) return;
        try {
            await axios.delete(`/api/super-admin/plans/${id}`);
            toast.success("Plan eliminado");
            fetchPlans();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al eliminar el plan");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-40">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-light text-gray-800">Planes</h2>
                    <p className="text-gray-500 mt-1">Define los límites y módulos que cada plan habilita.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-secondary text-primary-dark px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-secondary-light transition-all shadow-md font-bold"
                >
                    <Plus size={20} /> Crear Plan
                </button>
            </div>

            {plans.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
                    <Ticket className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500">Todavía no hay planes creados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((p) => (
                        <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-gray-800">{p.name}</h3>
                                <button onClick={() => handleDelete(p.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p><span className="font-bold">{p.maxPatients ?? "∞"}</span> pacientes máx.</p>
                                <p><span className="font-bold">{p.maxProfessionals ?? "∞"}</span> profesionales máx.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {p.modules.length === 0 ? (
                                    <span className="text-xs text-gray-400 italic">Sin módulos extra</span>
                                ) : p.modules.map((m) => (
                                    <span key={m} className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">{m}</span>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 pt-2 border-t border-gray-50">{p._count.companies} centro(s) usando este plan</p>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] w-full min-w-0 max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-800">Crear Plan</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-8 space-y-5">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Nombre</label>
                                <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Máx. Pacientes</label>
                                    <input type="number" min="0" placeholder="Ilimitado" value={form.maxPatients} onChange={(e) => setForm({ ...form, maxPatients: e.target.value })}
                                        className="w-full bg-gray-50 border border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Máx. Profesionales</label>
                                    <input type="number" min="0" placeholder="Ilimitado" value={form.maxProfessionals} onChange={(e) => setForm({ ...form, maxProfessionals: e.target.value })}
                                        className="w-full bg-gray-50 border border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Módulos habilitados</label>
                                <div className="space-y-2">
                                    {AVAILABLE_MODULES.map((mod) => (
                                        <label key={mod.key} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 cursor-pointer">
                                            <input type="checkbox" checked={form.modules.includes(mod.key)} onChange={() => toggleModule(mod.key)} className="accent-primary" />
                                            <span className="text-sm text-gray-700">{mod.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button
                                disabled={submitting}
                                type="submit"
                                className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting && <Loader2 className="animate-spin" size={20} />}
                                Crear Plan
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
