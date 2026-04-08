"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    User as UserIcon,
    Mail,
    Shield,
    Phone,
    Lock,
    Save,
    CheckCircle2,
    Camera,
    Palette,
    Upload,
    Loader2
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function ProfilePage() {
    const { data: session, update: updateSession } = useSession();
    const role = (session?.user as any)?.role;

    const [formData, setFormData] = useState({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        phone: "",
    });

    const [branding, setBranding] = useState({
        logoUrl: "",
        primaryColor: "#24343B",
        secondaryColor: "#EBA554"
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(role === "ADMIN");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (role === "ADMIN") {
            const fetchBranding = async () => {
                try {
                    const res = await axios.get("/api/admin/settings");
                    setBranding({
                        logoUrl: res.data.logoUrl || "",
                        primaryColor: res.data.primaryColor || "#24343B",
                        secondaryColor: res.data.secondaryColor || "#EBA554"
                    });
                } catch (error) {
                    console.error("Error fetching branding:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchBranding();
        }
    }, [role]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Save Profile
            // In a real app index route for profile update
            // await axios.put("/api/profile", formData);

            if (role === "ADMIN") {
                await axios.put("/api/admin/settings", {
                    ...branding,
                });
                toast.success("Branding actualizado correctamente");
            }

            if (formData.name !== session?.user?.name) {
                await updateSession({ name: formData.name });
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            toast.success("Perfil actualizado");
        } catch (error) {
            toast.error("Error al guardar los cambios");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-40 text-primary">
                <Loader2 className="animate-spin" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl animate-in fade-in duration-700 space-y-10">
            <div className="flex justify-between items-end border-b border-gray-50 pb-8">
                <div>
                    <h2 className="text-3xl font-light text-gray-800">Mi Perfil</h2>
                    <p className="text-gray-500 mt-1">Gestiona tu información personal{role === 'ADMIN' ? ' y la identidad del centro' : ''}.</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${role === 'ADMIN' ? 'bg-purple-50 text-purple-600' :
                    role === 'PSYCHOLOGIST' ? 'bg-primary/10 text-primary' : 'bg-sage/10 text-sage-dark'
                    }`}>
                    Cuenta de {role}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Avatar Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center gap-6 relative group">
                        <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center text-primary relative overflow-hidden ring-4 ring-primary/5">
                            {role === 'ADMIN' && branding.logoUrl ? (
                                <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <UserIcon size={64} className="opacity-20" />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="text-white" size={24} />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-gray-800">{formData.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">{session?.user?.email}</p>
                        </div>
                        <div className="w-full pt-6 border-t border-gray-50 flex gap-4 justify-center">
                            <div className="text-center">
                                <p className="text-xs font-bold text-gray-400 uppercase">Estado</p>
                                <p className="text-sm font-medium text-green-500">Verificado</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1a2b3b] p-8 rounded-[2.5rem] text-white space-y-4 shadow-xl">
                        <div className="flex items-center gap-3">
                            <Shield size={20} className="text-primary" />
                            <h4 className="font-medium">Seguridad</h4>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-3/4 rounded-full" />
                        </div>
                        <p className="text-[10px] text-white/40">Tu cuenta cumple con los estándares de seguridad de HealthSaaS.</p>
                    </div>
                </div>

                {/* Settings Form */}
                <div className="lg:col-span-2 space-y-8">
                    <form onSubmit={handleSave} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8 pb-12">
                        {/* Personal Info */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-primary mb-2">
                                <UserIcon size={18} />
                                <h3 className="font-bold uppercase text-xs tracking-widest">Información Personal</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Nombre Completo</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full px-5 py-4 bg-gray-100 border border-transparent rounded-2xl text-gray-400 cursor-not-allowed text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Branding Settings (ONLY FOR ADMIN) */}
                        {role === "ADMIN" && (
                            <div className="pt-8 border-t border-gray-50 space-y-6">
                                <div className="flex items-center gap-3 text-primary mb-2">
                                    <Palette size={18} />
                                    <h3 className="font-bold uppercase text-xs tracking-widest">Identidad del Centro (Logo)</h3>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase block mb-3">URL del Logo Profesional</label>
                                        <div className="flex gap-4">
                                            <input
                                                type="text"
                                                className="flex-1 bg-gray-50 border border-transparent rounded-2xl px-5 py-4 focus:bg-white focus:border-primary/20 outline-none text-sm transition-all"
                                                placeholder="https://ejemplo.com/logo.png"
                                                value={branding.logoUrl}
                                                onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                                            />
                                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-primary/20 transition-all">
                                                {branding.logoUrl ? (
                                                    <img src={branding.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                                                ) : (
                                                    <Upload size={20} className="text-gray-300" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase block mb-3">Color Primario</label>
                                            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl">
                                                <input
                                                    type="color"
                                                    className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
                                                    value={branding.primaryColor}
                                                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                                />
                                                <span className="text-xs font-mono font-bold text-gray-500 uppercase">{branding.primaryColor}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase block mb-3">Color Secundario</label>
                                            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl">
                                                <input
                                                    type="color"
                                                    className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent"
                                                    value={branding.secondaryColor}
                                                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                                                />
                                                <span className="text-xs font-mono font-bold text-gray-500 uppercase">{branding.secondaryColor}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-8 border-t border-gray-50 flex justify-end items-center gap-6">
                            {success && (
                                <div className="flex items-center gap-2 text-green-600 text-sm font-bold animate-in fade-in slide-in-from-right-2">
                                    <CheckCircle2 size={18} /> Cambios guardados
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-primary text-white px-12 py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center gap-2 disabled:opacity-50 active:scale-95"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                {isSaving ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </div>
                    </form>

                    {/* Additional Settings for roles */}
                    {role !== "ADMIN" && (
                        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                            <h3 className="text-xl font-medium text-gray-800">Notificaciones</h3>
                            <div className="space-y-4">
                                {[
                                    { label: "Recordatorios de citas (Email)", desc: "Recibe un correo 24 horas antes." },
                                    { label: "Alertas vía WhatsApp", desc: "Notificaciones directas a tu móvil." }
                                ].map((pref, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{pref.label}</p>
                                            <p className="text-xs text-gray-400">{pref.desc}</p>
                                        </div>
                                        <div className="w-10 h-5 bg-primary rounded-full p-1 relative cursor-pointer">
                                            <div className="w-3 h-3 bg-white rounded-full absolute right-1 shadow-sm" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
