"use client";

import { useState, useEffect } from "react";
import {
    Settings,
    Upload,
    Palette,
    Clock,
    User,
    Mail,
    Lock,
    Save,
    CheckCircle2,
    Loader2
} from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";

const DAYS = [
    { id: "mon", label: "Lunes" },
    { id: "tue", label: "Martes" },
    { id: "wed", label: "Miércoles" },
    { id: "thu", label: "Jueves" },
    { id: "fri", label: "Viernes" },
    { id: "sat", label: "Sábado" },
    { id: "sun", label: "Domingo" }
];

export default function AdminSettingsPage() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    tertiaryColor: "#948472",
        physicalRooms: 1
});

const [businessHours, setBusinessHours] = useState<any>({
    mon: { open: "08:00", close: "18:00", closed: false },
    tue: { open: "08:00", close: "18:00", closed: false },
    wed: { open: "08:00", close: "18:00", closed: false },
    thu: { open: "08:00", close: "18:00", closed: false },
    fri: { open: "08:00", close: "18:00", closed: false },
    sat: { open: "09:00", close: "13:00", closed: false },
    sun: { open: "00:00", close: "00:00", closed: true }
});

const [adminInfo, setAdminInfo] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    password: ""
});

useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await axios.get("/api/admin/settings");
            const data = response.data;
            setBranding({
                logoUrl: data.logoUrl || "",
                primaryColor: data.primaryColor || "#24343B",
                secondaryColor: data.secondaryColor || "#EBA554",
                tertiaryColor: data.tertiaryColor || "#948472",
                physicalRooms: data.physicalRooms || 1
            });
            if (data.businessHours) {
                setBusinessHours(data.businessHours);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
}, []);

const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
        await axios.put("/api/admin/settings", {
            ...branding,
            businessHours
        });

        // Also update admin profile if changed
        if (adminInfo.name !== session?.user?.name || adminInfo.password) {
            await axios.put(`/api/admin/users/${(session?.user as any).id}`, adminInfo);
            await update({ name: adminInfo.name });
        }

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
        alert("Error al guardar configuración");
    } finally {
        setSaving(false);
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
    <div className="max-w-6xl space-y-10 animate-in fade-in duration-500 pb-20">
        <div className="flex justify-between items-end border-b border-gray-50 pb-8">
            <div>
                <h2 className="text-3xl font-light text-gray-800">Configuración del Centro</h2>
                <p className="text-gray-500 mt-1">Personaliza la identidad visual y horarios de operación de tu HealthSaaS.</p>
            </div>
            <div className="flex items-center gap-4">
                {success && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-bold animate-in fade-in slide-in-from-right-2">
                        <CheckCircle2 size={18} /> Cambios aplicados
                    </div>
                )}
                <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Guardar Cambios
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Visual Identity */}
            <div className="lg:col-span-1 space-y-8">
                <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <Palette size={20} />
                        <h3 className="font-bold uppercase text-xs tracking-widest">Identidad Visual</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-400 block mb-2 uppercase">URL del Logo</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 bg-gray-50 border border-transparent rounded-xl px-4 py-3 focus:bg-white focus:border-primary/20 outline-none text-sm transition-all"
                                    placeholder="https://..."
                                    value={branding.logoUrl}
                                    onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                                />
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-50">
                                    {branding.logoUrl ? <img src={branding.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" /> : <Upload size={16} className="text-gray-400" />}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-400 block mb-2 uppercase">Color Primario</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                                        value={branding.primaryColor}
                                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                    />
                                    <span className="text-sm font-mono text-gray-600">{branding.primaryColor}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-400 block mb-2 uppercase">Color Secundario</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                                        value={branding.secondaryColor}
                                        onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                                    />
                                    <span className="text-sm font-mono text-gray-600">{branding.secondaryColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1a2b3b] p-8 rounded-[3rem] text-white space-y-4 shadow-xl">
                    <h4 className="font-light text-secondary">Tip de Diseño</h4>
                    <p className="text-xs text-white/60 leading-relaxed">
                        Asegúrate de que el color secundario tenga suficiente contraste con el primario para botones y estados activos.
                    </p>
                </div>
            </div>

            {/* Business Hours */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <Clock size={20} />
                        <h3 className="font-bold uppercase text-xs tracking-widest">Horarios de Operación</h3>
                    </div>

                    <div className="space-y-4">
                        {DAYS.map((day) => (
                            <div key={day.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors">
                                <div className="w-24">
                                    <p className="font-bold text-gray-700">{day.label}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <input
                                            disabled={businessHours[day.id]?.closed}
                                            type="time"
                                            className="bg-white border-none rounded-lg px-2 py-1 text-sm shadow-sm focus:ring-1 focus:ring-primary disabled:opacity-30"
                                            value={businessHours[day.id]?.open}
                                            onChange={(e) => setBusinessHours({
                                                ...businessHours,
                                                [day.id]: { ...businessHours[day.id], open: e.target.value }
                                            })}
                                        />
                                        <span className="text-gray-400 text-xs">A</span>
                                        <input
                                            disabled={businessHours[day.id]?.closed}
                                            type="time"
                                            className="bg-white border-none rounded-lg px-2 py-1 text-sm shadow-sm focus:ring-1 focus:ring-primary disabled:opacity-30"
                                            value={businessHours[day.id]?.close}
                                            onChange={(e) => setBusinessHours({
                                                ...businessHours,
                                                [day.id]: { ...businessHours[day.id], close: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="size-4 rounded border-gray-300 text-primary accent-primary"
                                            checked={businessHours[day.id]?.closed}
                                            onChange={(e) => setBusinessHours({
                                                ...businessHours,
                                                [day.id]: { ...businessHours[day.id], closed: e.target.checked }
                                            })}
                                        />
                                        <span className="text-xs font-bold text-gray-400 uppercase">Cerrado</span>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Admin Profile Update Section */}
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <User size={20} />
                        <h3 className="font-bold uppercase text-xs tracking-widest">Información de Administrador</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-2">
                            <label className="font-semibold text-gray-700">Nombre</label>
                            <div className="relative">
                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all"
                                    value={adminInfo.name}
                                    onChange={(e) => setAdminInfo({ ...adminInfo, name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="font-semibold text-gray-700">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all"
                                    value={adminInfo.email}
                                    onChange={(e) => setAdminInfo({ ...adminInfo, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                            <label className="font-semibold text-gray-700">Cambiar Contraseña (opcional)</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    placeholder="Nueva contraseña..."
                                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all"
                                    value={adminInfo.password}
                                    onChange={(e) => setAdminInfo({ ...adminInfo, password: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}

