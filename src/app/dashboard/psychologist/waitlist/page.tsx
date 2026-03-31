"use client";

import { useState } from "react";
import {
    Users,
    Clock,
    MessageSquare,
    Calendar as CalendarIcon,
    Search,
    ArrowUpCircle,
    MoreVertical,
    Loader2,
    CalendarCheck
} from "lucide-react";
import { useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { WaitlistSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ClipboardX } from "lucide-react";

export default function WaitlistPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [waitlist, setWaitlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWaitlist = async () => {
        try {
            const response = await axios.get("/api/psychologist/waitlist");
            setWaitlist(response.data);
        } catch (error) {
            console.error("Error fetching waitlist:", error);
            toast.error("Error al cargar la lista de espera");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWaitlist();
    }, []);

    const filteredWaitlist = waitlist.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-secondary/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    <h2 className="text-3xl font-light text-primary relative z-10">Gestión de Espera</h2>
                    <p className="text-gray-500 mt-2 relative z-10">Prioriza y contacta a los pacientes que esperan una cita contigo.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar paciente en lista..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all"
                    />
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <WaitlistSkeleton />
                    ) : filteredWaitlist.length === 0 ? (
                        <EmptyState
                            title="Sin pacientes en lista"
                            description="La lista de espera está vacía actualmente. Aparecerán aquí los pacientes que tienen preferencia de horarios y no alcanzaron espacio."
                            icon={ClipboardX}
                        />
                    ) : (
                        filteredWaitlist.map((item) => (
                            <div key={item.id} className="p-6 rounded-[2rem] bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group shadow-none hover:shadow-md">
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary border border-gray-100">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-800">{item.name}</h4>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${item.priority === 'Alta' ? 'bg-secondary/10 text-secondary' :
                                                item.priority === 'Media' ? 'bg-tertiary/10 text-tertiary' : 'bg-blue-50 text-blue-500'
                                                }`}>
                                                {item.priority}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                            <Clock size={12} /> Esperando desde el {new Date(item.addedDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 px-4">
                                    <p className="text-xs text-gray-500 font-medium italic">"{item.reason}"</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <CalendarIcon size={12} className="text-primary" />
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Preferencia: {item.preferredSchedule}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-all">
                                        <ArrowUpCircle size={16} /> Asignar Cita
                                    </button>
                                    <button className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary transition-colors">
                                        <MessageSquare size={18} />
                                    </button>
                                    <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-6 border-t border-gray-50">
                    <p className="text-xs text-center text-gray-400 italic">
                        Los pacientes reciben una notificación automática si habilitas un espacio que coincida con su preferencia.
                    </p>
                </div>
            </div>
        </div>
    );
}
