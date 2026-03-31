"use client";

import { useState, useEffect } from "react";
import {
    Activity,
    Search,
    Loader2,
    Calendar,
    Ticket,
    History,
    Plus,
    X,
    Filter,
import { ArrowRight, Ticket as TicketIcon } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { TableSkeleton, CardSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";

interface PatientTherapy {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    inventory: {
        totalAssigned: number;
        remaining: number;
    } | null;
    reservedCount: number;
}

export default function AdminTherapyPage() {
    const [patients, setPatients] = useState<PatientTherapy[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<PatientTherapy | null>(null);
    const [adjustData, setAdjustData] = useState({ amount: 1, notes: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTherapyData();
    }, []);

    const fetchTherapyData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/admin/therapy/list");
            setPatients(response.data);
        } catch (error) {
            console.error("Error fetching therapy data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdjustSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatient) return;
        setSubmitting(true);
        try {
            await axios.post("/api/admin/therapy", {
                patientId: selectedPatient.id,
                amount: adjustData.amount,
                notes: adjustData.notes
            });
            setIsAdjustModalOpen(false);
            fetchTherapyData();
        } catch (error) {
            toast.error("Error al actualizar inventario");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-light text-gray-800">Gestión de Terapias</h2>
                    <p className="text-gray-500 mt-1">Control de saldos, recargas y asignación de sesiones para pacientes.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-[#1a2b3b] p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 transform group-hover:scale-110 transition-transform opacity-10">
                        <Ticket size={80} />
                    </div>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Total Sesiones Saldo</p>
                    <h3 className="text-4xl font-bold">
                        {patients.reduce((acc, p) => acc + (p.inventory?.remaining || 0), 0)}
                    </h3>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 transform group-hover:scale-110 transition-transform text-secondary opacity-10">
                        <Calendar size={80} />
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Sesiones Reservadas</p>
                    <h3 className="text-4xl font-bold text-gray-800">
                        {patients.reduce((acc, p) => acc + p.reservedCount, 0)}
                    </h3>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 transform group-hover:scale-110 transition-transform text-primary opacity-10">
                        <Activity size={80} />
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Capacidad Activa</p>
                    <h3 className="text-4xl font-bold text-primary">
                        {filteredPatients.length} <span className="text-sm font-light text-gray-400">Pacientes</span>
                    </h3>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-gray-50 pb-6">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar paciente por nombre o correo..."
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-gray-50 p-4 rounded-xl text-gray-400 hover:text-primary transition-colors">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="w-full">
                            <div className="hidden md:block"><TableSkeleton /></div>
                            <div className="md:hidden block"><CardSkeleton /></div>
                        </div>
                    ) : (
                        <>
                            <table className="w-full text-left hidden md:table">
                                <thead>
                                    <tr className="border-b border-gray-50">
                                        <th className="px-6 py-4 font-medium text-gray-400 text-xs uppercase">Paciente</th>
                                        <th className="px-6 py-4 font-medium text-gray-400 text-xs uppercase">Saldo (Pagadas)</th>
                                        <th className="px-6 py-4 font-medium text-gray-400 text-xs uppercase">Reservadas</th>
                                        <th className="px-6 py-4 font-medium text-gray-400 text-xs uppercase text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredPatients.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                                        {p.name?.charAt(0) || "P"}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{p.name}</p>
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{p.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-4 py-2 rounded-xl text-base font-bold ${(p.inventory?.remaining || 0) > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-400"
                                                        }`}>
                                                        {p.inventory?.remaining || 0}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Sesiones</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-bold text-gray-700">{p.reservedCount}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Agendadas</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPatient(p);
                                                            setIsAdjustModalOpen(true);
                                                        }}
                                                        className="bg-primary text-white p-3 rounded-xl hover:bg-primary-dark transition-all shadow-md group/btn"
                                                    >
                                                        <Plus size={18} className="group-hover/btn:scale-110 transition-transform" />
                                                    </button>
                                                    <button className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:text-primary transition-colors">
                                                        <History size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Mobile Cards View */}
                            <div className="md:hidden space-y-4">
                                {filteredPatients.map((p) => (
                                    <div key={p.id} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 flex flex-col gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                                                {p.name?.charAt(0) || "P"}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800 text-lg">{p.name}</p>
                                                <p className="text-xs text-gray-400">{p.email}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <div className="bg-white p-3 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">Saldo</span>
                                                <span className={`text-xl font-bold ${(p.inventory?.remaining || 0) > 0 ? "text-green-600" : "text-red-400"}`}>
                                                    {p.inventory?.remaining || 0}
                                                </span>
                                            </div>
                                            <div className="bg-white p-3 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">Reservadas</span>
                                                <span className="text-xl font-bold text-gray-700">{p.reservedCount}</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2">
                                            <button onClick={() => { setSelectedPatient(p); setIsAdjustModalOpen(true); }} className="bg-primary text-white p-3 rounded-xl flex items-center gap-2 hover:bg-primary-dark shadow-md flex-1 justify-center text-sm font-bold">
                                                <Plus size={18} /> Recargar
                                            </button>
                                            <button className="bg-white border shadow-sm text-gray-400 hover:text-primary transition-colors p-3 rounded-xl">
                                                <History size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Adjust Modal */}
            {
                isAdjustModalOpen && selectedPatient && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-secondary/5">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Recarga de Sesiones</h3>
                                    <p className="text-xs text-gray-500">{selectedPatient.name}</p>
                                </div>
                                <button onClick={() => setIsAdjustModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleAdjustSubmit} className="p-8 space-y-6">
                                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Saldo Actual:</span>
                                    <span className="text-2xl font-bold text-primary">{selectedPatient.inventory?.remaining || 0}</span>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Sesiones a Añadir</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            required
                                            type="number"
                                            min="1"
                                            className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all text-2xl font-bold text-center"
                                            value={adjustData.amount}
                                            onChange={(e) => setAdjustData({ ...adjustData, amount: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Concepto / Notas</label>
                                    <textarea
                                        className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all min-h-[100px] resize-none"
                                        placeholder="Ej: Pago de paquete premium"
                                        value={adjustData.notes}
                                        onChange={(e) => setAdjustData({ ...adjustData, notes: e.target.value })}
                                    />
                                </div>

                                <button
                                    disabled={submitting}
                                    type="submit"
                                    className="w-full bg-secondary text-primary-dark py-5 rounded-2xl font-bold hover:bg-secondary-light transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                    Confirmar Recarga
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

