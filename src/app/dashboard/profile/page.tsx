"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
    User as UserIcon,
    Shield,
    Save,
    CheckCircle2,
    Camera,
    Palette,
    Upload,
    Loader2
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export default function ProfilePage() {
    const { data: session, update: updateSession } = useSession();
    const role = (session?.user as any)?.role;

    const [formData, setFormData] = useState({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        phone: "",
    });

    const [avatarUrl, setAvatarUrl] = useState<string>((session?.user as any)?.avatarUrl || "");
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [branding, setBranding] = useState({
        logoUrl: "",
        primaryColor: "#24343B",
        secondaryColor: "#EBA554"
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!session?.user) return;

        setFormData((prev) => ({ ...prev, name: session.user?.name || "", email: session.user?.email || "" }));
        setAvatarUrl((session.user as any)?.avatarUrl || "");

        const fetchProfile = async () => {
            try {
                const res = await axios.get("/api/profile");
                setFormData((prev) => ({ ...prev, phone: res.data.phone || "" }));
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

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
            }
        };

        Promise.all([fetchProfile(), role === "ADMIN" ? fetchBranding() : Promise.resolve()])
            .finally(() => setIsLoading(false));
    }, [session?.user, role]);

    const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Selecciona un archivo de imagen válido");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("La imagen no puede superar 5MB");
            return;
        }

        setUploadingAvatar(true);
        try {
            const userId = (session?.user as any)?.id || "anon";
            const path = `avatars/${userId}-${Date.now()}-${file.name}`;
            const fileRef = storageRef(storage, path);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            setAvatarUrl(url);
            toast.success("Foto cargada. No olvides guardar los cambios.");
        } catch (error) {
            console.error("Error uploading avatar:", error);
            toast.error("No se pudo subir la imagen");
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await axios.put("/api/profile", {
                name: formData.name,
                phone: formData.phone,
                avatarUrl
            });

            if (role === "ADMIN") {
                await axios.put("/api/admin/settings", {
                    ...branding,
                });
                toast.success("Branding actualizado correctamente");
            }

            await updateSession({ name: res.data.name, avatarUrl: res.data.avatarUrl });

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
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarSelect}
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center text-primary relative overflow-hidden ring-4 ring-primary/5 cursor-pointer"
                        >
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
                            ) : role === 'ADMIN' && branding.logoUrl ? (
                                <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <UserIcon size={64} className="opacity-20" />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {uploadingAvatar ? (
                                    <Loader2 className="text-white animate-spin" size={24} />
                                ) : (
                                    <Camera className="text-white" size={24} />
                                )}
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-gray-800">{formData.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">{session?.user?.email}</p>
                        </div>
                        <div className="w-full pt-6 border-t border-gray-50 flex gap-4 justify-center">
                            <div className="text-center">
                                <p className="text-xs font-bold text-gray-400 uppercase">Estado</p>
                                <p className="text-sm font-medium text-green-500">Activo</p>
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
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Teléfono</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Ej. 3001234567"
                                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all text-sm"
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
                </div>
            </div>
        </div>
    );
}
