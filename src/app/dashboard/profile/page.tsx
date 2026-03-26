"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
    User as UserIcon,
    Mail,
    Shield,
    Phone,
    Lock,
    Save,
    CheckCircle2,
    Camera
} from "lucide-react";

export default function ProfilePage() {
    const { data: session } = useSession();
    const role = (session?.user as any)?.role;

    const [formData, setFormData] = useState({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        phone: role === "PSYCHOLOGIST" ? "+57 321 000 1122" : "+57 301 555 4433",
    });

    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }, 1500);
    };

    return (
        <div className="max-w-4xl animate-in fade-in duration-700 space-y-10">
            <div className="flex justify-between items-end border-b border-gray-50 pb-8">
                <div>
                    <h2 className="text-3xl font-light text-gray-800">Mi Perfil</h2>
                    <p className="text-gray-500 mt-1">Gestiona tu información personal y preferencias de seguridad.</p>
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
                        <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center text-primary relative overflow-hidden">
                            <UserIcon size={64} className="opacity-20" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="text-white" size={24} />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-gray-800">{session?.user?.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">{session?.user?.email}</p>
                        </div>
                        <div className="w-full pt-6 border-t border-gray-50 flex gap-4 justify-center">
                            <div className="text-center">
                                <p className="text-xs font-bold text-gray-400 uppercase">Estado</p>
                                <p className="text-sm font-medium text-green-500">Verificado</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1a2b3b] p-8 rounded-[2.5rem] text-white space-y-4">
                        <div className="flex items-center gap-3">
                            <Shield size={20} className="text-primary" />
                            <h4 className="font-medium">Nivel de Seguridad</h4>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-3/4 rounded-full" />
                        </div>
                        <p className="text-[10px] text-white/40">Tu cuenta cumple con los estándares de seguridad de la plataforma.</p>
                    </div>
                </div>

                {/* Settings Form */}
                <div className="lg:col-span-2 space-y-8">
                    <form onSubmit={handleSave} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Nombre Completo</label>
                                <div className="relative">
                                    <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-transparent rounded-2xl text-gray-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Teléfono de Contacto</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Contraseña</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        value="********"
                                        disabled
                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl text-gray-800"
                                    />
                                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary uppercase hover:underline">Cambiar</button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-50 flex justify-end items-center gap-6">
                            {success && (
                                <div className="flex items-center gap-2 text-green-600 text-sm font-medium animate-in fade-in slide-in-from-right-2">
                                    <CheckCircle2 size={18} /> Cambios guardados
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-primary text-white px-10 py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                                {isSaving ? "Guardando..." : "Guardar Perfil"}
                            </button>
                        </div>
                    </form>

                    {/* Additional Settings - Only for Psychologists and Patients */}
                    {role !== "ADMIN" && (
                        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                            <h3 className="text-xl font-medium text-gray-800">Notificaciones</h3>
                            <div className="space-y-4">
                                {[
                                    { label: "Recordatorios de citas (Email)", desc: "Recibe un correo 24 horas antes." },
                                    { label: "Alertas vía WhatsApp", desc: "Notificaciones directas a tu móvil." },
                                    { label: "Boletín de salud mental", desc: "Consejos semanales de nuestros expertos." }
                                ].map((pref, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{pref.label}</p>
                                            <p className="text-xs text-gray-400">{pref.desc}</p>
                                        </div>
                                        <div className="w-12 h-6 bg-primary rounded-full p-1 relative cursor-pointer">
                                            <div className="w-4 h-4 bg-white rounded-full absolute right-1 shadow-sm" />
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
