"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Search,
    Loader2,
    ChevronRight,
    Phone,
    Mail,
    Calendar,
    Filter
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function PsychologistPatientsPage() {
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await axios.get("/api/psychologist/patients");
            setPatients(response.data);
        } catch (error) {
            console.error("Error fetching patients:", error);
        } finally {
            setLoading(false);
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
                    <h2 className="text-3xl font-light text-gray-800">Mis Pacientes</h2>
                    <p className="text-gray-500 mt-1">Gestiona la información y el historial clínico de tus pacientes asignados.</p>
                </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
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
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-primary" size={40} />
                        </div>
                    ) : filteredPatients.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-[2rem]">
                            <Users className="mx-auto text-gray-200 mb-4" size={48} />
                            <p className="text-gray-400">No se encontraron pacientes.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="px-6 py-4 font-medium text-gray-400 text-xs uppercase">Paciente</th>
                                    <th className="px-6 py-4 font-medium text-gray-400 text-xs uppercase">Contacto</th>
                                    <th className="px-6 py-4 font-medium text-gray-400 text-xs uppercase">Saldo Terapia</th>
                                    <th className="px-6 py-4 font-medium text-gray-400 text-xs uppercase font-bold text-right">Última Cita</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredPatients.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                                        onClick={() => router.push(`/dashboard/psychologist/patients/${p.id}`)}
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
                                                    {p.name?.charAt(0) || "P"}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                                                        {p.name}
                                                        <ChevronRight size={14} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">ID: {p.id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1 text-[11px] text-gray-500">
                                                <span className="flex items-center gap-1"><Mail size={12} className="text-gray-300" /> {p.email}</span>
                                                {p.phone && <span className="flex items-center gap-1"><Phone size={12} className="text-gray-300" /> {p.phone}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${p.therapyBalance > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                                                }`}>
                                                {p.therapyBalance} sesiones
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {p.lastAppointment ? (
                                                <div className="text-xs">
                                                    <p className="font-bold text-gray-700">{format(new Date(p.lastAppointment.startTime), 'd MMM, yyyy', { locale: es })}</p>
                                                    <p className="text-gray-400">{p.lastAppointment.status}</p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-300 italic">Sin citas registradas</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

