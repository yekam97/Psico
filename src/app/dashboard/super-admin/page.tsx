"use client";

import { useState, useEffect } from "react";
import { Building2, Plus, X, Loader2, Users, UserCog, Ticket } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { SPECIALTIES, SPECIALTY_LABELS, specialtyLabel } from "@/lib/specialty";

interface Plan {
    id: string;
    name: string;
    maxPatients: number | null;
    maxProfessionals: number | null;
    modules: string[];
}

interface CompanyRow {
    id: string;
    name: string;
    domain: string;
    specialty: string;
    planId: string | null;
    plan: Plan | null;
    counts: { admins: number; professionals: number; patients: number };
}

export default function SuperAdminCompaniesPage() {
    const [companies, setCompanies] = useState<CompanyRow[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        companyName: "",
        domain: "",
        specialty: "PSYCHOLOGY",
        planId: "",
        adminName: "",
        adminEmail: "",
        adminPassword: ""
    });

    const fetchAll = async () => {
        try {
            const [companiesRes, plansRes] = await Promise.all([
                axios.get("/api/super-admin/companies"),
                axios.get("/api/super-admin/plans")
            ]);
            setCompanies(companiesRes.data);
            setPlans(plansRes.data);
        } catch (error) {
            console.error("Error loading super admin data:", error);
            toast.error("Error al cargar centros");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post("/api/super-admin/companies", form);
            toast.success("Centro creado correctamente");
            setIsModalOpen(false);
            setForm({ companyName: "", domain: "", specialty: "PSYCHOLOGY", planId: "", adminName: "", adminEmail: "", adminPassword: "" });
            fetchAll();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al crear el centro");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePlanChange = async (companyId: string, planId: string) => {
        try {
            await axios.put(`/api/super-admin/companies/${companyId}`, { planId: planId || null });
            toast.success("Plan actualizado");
            fetchAll();
        } catch {
            toast.error("Error al actualizar el plan");
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
                    <h2 className="text-3xl font-light text-gray-800">Centros de Salud</h2>
                    <p className="text-gray-500 mt-1">Administra todos los centros registrados en la plataforma.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-secondary text-primary-dark px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-secondary-light transition-all shadow-md font-bold"
                >
                    <Plus size={20} /> Crear Centro
                </button>
            </div>

            {companies.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
                    <Building2 className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500">Todavía no hay centros registrados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {companies.map((c) => (
                        <div key={c.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{c.name}</h3>
                                    <p className="text-xs text-gray-400">{c.domain}</p>
                                </div>
                                <span className="bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                                    {specialtyLabel(c.specialty)}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-gray-50 rounded-2xl py-3">
                                    <UserCog size={16} className="mx-auto text-gray-400 mb-1" />
                                    <p className="text-lg font-bold text-gray-800">{c.counts.admins}</p>
                                    <p className="text-[10px] text-gray-400 uppercase">Admins</p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl py-3">
                                    <Users size={16} className="mx-auto text-gray-400 mb-1" />
                                    <p className="text-lg font-bold text-gray-800">{c.counts.professionals}</p>
                                    <p className="text-[10px] text-gray-400 uppercase truncate">Prof.</p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl py-3">
                                    <Ticket size={16} className="mx-auto text-gray-400 mb-1" />
                                    <p className="text-lg font-bold text-gray-800">{c.counts.patients}</p>
                                    <p className="text-[10px] text-gray-400 uppercase">Pacientes</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Plan</label>
                                <select
                                    value={c.planId || ""}
                                    onChange={(e) => handlePlanChange(c.id, e.target.value)}
                                    className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary/20 outline-none transition-all"
                                >
                                    <option value="">Sin plan (ilimitado)</option>
                                    {plans.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] w-full min-w-0 max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-800">Crear Nuevo Centro</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-8 space-y-5 overflow-y-auto">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Nombre del Centro</label>
                                <input required type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                                    className="w-full bg-gray-50 border border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Dominio (único)</label>
                                <input required type="text" placeholder="ej. sonrisas.healthsaas.com" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })}
                                    className="w-full bg-gray-50 border border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Especialidad</label>
                                <select required value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                                    className="w-full bg-gray-50 border border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all text-sm">
                                    {SPECIALTIES.map((s) => (
                                        <option key={s} value={s}>{SPECIALTY_LABELS[s]}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Plan</label>
                                <select value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })}
                                    className="w-full bg-gray-50 border border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all text-sm">
                                    <option value="">Sin plan (ilimitado)</option>
                                    {plans.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 border-t border-gray-50 space-y-5">
                                <p className="text-xs font-bold text-primary uppercase tracking-wider">Cuenta del Administrador</p>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Nombre</label>
                                    <input required type="text" value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                                        className="w-full bg-gray-50 border border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Correo</label>
                                    <input required type="email" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                                        className="w-full bg-gray-50 border border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Contraseña</label>
                                    <input required type="password" value={form.adminPassword} onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                                        className="w-full bg-gray-50 border border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all text-sm" />
                                </div>
                            </div>

                            <button
                                disabled={submitting}
                                type="submit"
                                className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting && <Loader2 className="animate-spin" size={20} />}
                                Crear Centro
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
