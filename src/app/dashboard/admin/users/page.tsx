"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Search,
    UserPlus,
    MoreVertical,
    Mail,
    Phone,
    Calendar as CalendarIcon,
    ShieldCheck,
    X,
    Loader2,
    Trash2,
    Edit2,
    Activity
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface UserProfile {
    id: string;
    phone: string | null;
    therapyInventory?: {
        remaining: number;
        totalAssigned: number;
    };
    assignedPsychologists?: Array<{
        psychologist: {
            user: { name: string };
        }
    }>;
}

interface User {
    id: string;
    email: string;
    name: string | null;
    role: "ADMIN" | "PSYCHOLOGIST" | "PATIENT";
    createdAt: string;
    profile: UserProfile | null;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTherapyModalOpen, setIsTherapyModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Therapy form state
    const [therapyData, setTherapyData] = useState({
        amount: 1,
        notes: ""
    });

    // Form state
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        role: "PATIENT",
        phone: "",
        psychologistIds: [] as string[]
    });

    const fetchUsers = async () => {
        try {
            const response = await axios.get("/api/admin/users");
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const psychologists = users.filter(u => u.role === "PSYCHOLOGIST");

    const handleOpenModal = (user: User | null = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                email: user.email,
                password: "", // Don't show password
                name: user.name || "",
                role: user.role,
                phone: user.profile?.phone || "",
                psychologistIds: user.profile?.assignedPsychologists?.map(a => (a as any).psychologistId) || []
            });
        } else {
            setEditingUser(null);
            setFormData({
                email: "",
                password: "",
                name: "",
                role: "PATIENT",
                phone: "",
                psychologistIds: []
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) return;

        const promise = axios.delete(`/api/admin/users/${id}`);
        toast.promise(promise, {
            loading: 'Eliminando usuario...',
            success: () => {
                fetchUsers();
                return 'Usuario eliminado correctamente';
            },
            error: 'Error al eliminar usuario'
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingUser) {
                await axios.put(`/api/admin/users/${editingUser.id}`, formData);
                toast.success("Usuario actualizado");
            } else {
                await axios.post("/api/admin/users", formData);
                toast.success("Usuario creado correctamente");
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al procesar solicitud");
        } finally {
            setSubmitting(false);
        }
    };

    const handleTherapySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setSubmitting(true);
        try {
            await axios.post("/api/admin/therapy", {
                patientId: editingUser.profile?.id,
                amount: therapyData.amount,
                notes: therapyData.notes
            });
            toast.success("Inventario de terapias actualizado");
            setIsTherapyModalOpen(false);
            setTherapyData({ amount: 1, notes: "" });
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al actualizar terapias");
        } finally {
            setSubmitting(false);
        }
    };

    const handleHistoryOpen = async (patientId: string) => {
        setIsHistoryModalOpen(true);
        setLoadingHistory(true);
        setHistoryData([]);
        try {
            const response = await axios.get(`/api/admin/therapy/history/${patientId}`);
            setHistoryData(response.data);
        } catch (error) {
            toast.error("Error al cargar historial");
        } finally {
            setLoadingHistory(false);
        }
    };

    const filteredUsers = users.filter((u) => {
        const matchesSearch = (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-light text-gray-800">Gestión de Usuarios</h2>
                    <p className="text-gray-500 mt-1">Administra el acceso y roles de todos los miembros del centro.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-secondary text-primary-dark px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-secondary-light transition-all shadow-md font-bold"
                >
                    <UserPlus size={20} /> Crear Usuario
                </button>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o correo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        {["ALL", "PSYCHOLOGIST", "PATIENT", "ADMIN"].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRoleFilter(r)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${roleFilter === r ? "bg-primary text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                {r === "ALL" ? "Todos" : r === "PSYCHOLOGIST" ? "Psicólogos" : r === "PATIENT" ? "Pacientes" : "Admins"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-primary" size={40} />
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="px-6 py-4 font-medium text-gray-400 text-xs uppercase">Usuario</th>
                                    <th className="px-6 py-4 font-medium text-gray-400 text-xs uppercase">Rol</th>
                                    <th className="px-6 py-4 font-medium text-gray-400 text-xs uppercase">Detalles</th>
                                    <th className="px-6 py-4 font-medium text-gray-400 text-xs uppercase text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                                    {user.name?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{user.name}</p>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1"><Mail size={12} /> {user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${user.role === 'ADMIN' ? 'bg-primary text-white' :
                                                user.role === 'PSYCHOLOGIST' ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-xs text-gray-500 space-y-1">
                                                {user.profile?.phone && <p className="flex items-center gap-1"><Phone size={12} /> {user.profile.phone}</p>}
                                                {user.role === "PATIENT" && user.profile?.therapyInventory && (
                                                    <p className="text-primary font-bold">Terapias: {user.profile.therapyInventory.remaining}</p>
                                                )}
                                                {user.role === "PATIENT" && user.profile?.assignedPsychologists && user.profile.assignedPsychologists.length > 0 && (
                                                    <p className="text-[10px] italic">Asignado a: {user.profile.assignedPsychologists.map(a => a.psychologist.user.name).join(", ")}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {user.role === "PATIENT" && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setEditingUser(user);
                                                                handleHistoryOpen(user.profile?.id!);
                                                            }}
                                                            className="text-gray-400 hover:text-primary transition-colors p-2"
                                                            title="Ver Historial"
                                                        >
                                                            <CalendarIcon size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingUser(user);
                                                                setIsTherapyModalOpen(true);
                                                            }}
                                                            className="text-gray-400 hover:text-secondary transition-colors p-2"
                                                            title="Gestionar Terapias"
                                                        >
                                                            <Activity size={18} />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleOpenModal(user)}
                                                    className="text-gray-400 hover:text-primary transition-colors p-2"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {!loading && filteredUsers.length === 0 && (
                        <div className="text-center py-20 text-gray-400">
                            No se encontraron usuarios que coincidan con la búsqueda.
                        </div>
                    )}
                </div>
            </div>

            {/* History Modal */}
            {isHistoryModalOpen && editingUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-end">
                    <div className="bg-white w-full max-w-md h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Historial de Terapias</h3>
                                <p className="text-xs text-gray-500">{editingUser.name}</p>
                            </div>
                            <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {loadingHistory ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="animate-spin text-primary" size={40} />
                                </div>
                            ) : historyData.length === 0 ? (
                                <p className="text-center text-gray-400 py-20">No hay transacciones registradas.</p>
                            ) : (
                                <div className="space-y-4">
                                    {historyData.map((t: any) => (
                                        <div key={t.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${t.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                {t.amount > 0 ? `+${t.amount}` : t.amount}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-800 uppercase tracking-tight">{t.type.replace('_', ' ')}</p>
                                                <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                                {t.notes && <p className="text-xs text-gray-500 mt-1 italic">"{t.notes}"</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-xl font-bold text-gray-800">
                                    {editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Nombre Completo</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Email</label>
                                            <input
                                                required
                                                type="email"
                                                className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Teléfono</label>
                                            <input
                                                type="text"
                                                className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    {!editingUser && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Password</label>
                                            <input
                                                required={!editingUser}
                                                type="password"
                                                className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Rol</label>
                                        <select
                                            className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all appearance-none"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                        >
                                            <option value="PATIENT">Paciente</option>
                                            <option value="PSYCHOLOGIST">Psicólogo</option>
                                            <option value="ADMIN">Administrador</option>
                                        </select>
                                    </div>

                                    {formData.role === "PATIENT" && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Asignar Psicólogos (Máx 2)</label>
                                            <div className="space-y-2 max-h-40 overflow-y-auto p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                {psychologists.map(p => (
                                                    <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            className="size-5 rounded-md border-gray-300 text-primary focus:ring-primary accent-primary"
                                                            checked={formData.psychologistIds.includes(p.profile?.id || "")}
                                                            onChange={(e) => {
                                                                const profileId = p.profile?.id;
                                                                if (!profileId) return;

                                                                const ids = e.target.checked
                                                                    ? [...formData.psychologistIds, profileId].slice(0, 2)
                                                                    : formData.psychologistIds.filter(id => id !== profileId);
                                                                setFormData({ ...formData, psychologistIds: ids });
                                                            }}
                                                        />
                                                        <span className="text-sm text-gray-700 group-hover:text-primary font-medium">{p.name || p.email}</span>
                                                    </label>
                                                ))}
                                                {psychologists.length === 0 && <p className="text-xs text-gray-400">No hay psicólogos registrados</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="pt-6">
                                    <button
                                        disabled={submitting}
                                        type="submit"
                                        className="w-full bg-primary text-white py-5 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {submitting && <Loader2 className="animate-spin" size={20} />}
                                        {editingUser ? "Guardar Cambios" : "Crear Usuario"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Therapy Modal */}
            {
                isTherapyModalOpen && editingUser && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-secondary/5">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Gestionar Terapias</h3>
                                    <p className="text-xs text-gray-500">{editingUser.name}</p>
                                </div>
                                <button onClick={() => setIsTherapyModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleTherapySubmit} className="p-8 space-y-6">
                                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Saldo Actual:</span>
                                    <span className="text-2xl font-bold text-primary">{editingUser.profile?.therapyInventory?.remaining || 0}</span>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Cantidad a Sumar</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all text-xl font-bold text-center"
                                        value={therapyData.amount}
                                        onChange={(e) => setTherapyData({ ...therapyData, amount: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Notas / Concepto</label>
                                    <textarea
                                        className="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-primary/20 outline-none transition-all min-h-[100px] resize-none"
                                        placeholder="Ej: Compra de paquete 10 sesiones"
                                        value={therapyData.notes}
                                        onChange={(e) => setTherapyData({ ...therapyData, notes: e.target.value })}
                                    />
                                </div>

                                <button
                                    disabled={submitting}
                                    type="submit"
                                    className="w-full bg-secondary text-primary-dark py-5 rounded-2xl font-bold hover:bg-secondary-light transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 className="animate-spin" size={20} />}
                                    Actualizar Inventario
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

