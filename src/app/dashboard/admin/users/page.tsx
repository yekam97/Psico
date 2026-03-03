"use client";

import { useState } from "react";
import {
    Users,
    Search,
    Filter,
    UserPlus,
    MoreVertical,
    Mail,
    Phone,
    Calendar as CalendarIcon,
    ShieldCheck
} from "lucide-react";

export default function AdminUsersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");

    const users = [
        { id: "1", name: "Dr. Roberto Casas", email: "psicologo@clinica.com", role: "PSYCHOLOGIST", status: "Activo", phone: "+57 321 000 1122", joined: "2026-01-10" },
        { id: "2", name: "Ana Maria", email: "paciente@correo.com", role: "PATIENT", status: "Activo", phone: "+57 301 555 4433", joined: "2026-02-15" },
        { id: "3", name: "Carlos Sanchez", email: "carlos@correo.com", role: "PATIENT", status: "Pendiente", phone: "+57 310 999 8877", joined: "2026-03-01" },
        { id: "4", name: "Dra. Elena Ruiz", email: "elena@clinica.com", role: "PSYCHOLOGIST", status: "Activo", phone: "+57 322 111 2233", joined: "2026-01-20" },
    ];

    const filteredUsers = users.filter((u) => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
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
                {/* Replaced the original button with the new Link component */}
                <button className="bg-secondary text-primary-dark px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-secondary-light transition-all shadow-md font-bold">
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
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="px-6 py-4 font-medium text-gray-400 text-xs uppercase">Usuario</th>
                                <th className="px-6 py-4 font-medium text-gray-400 text-xs uppercase">Rol</th>
                                <th className="px-6 py-4 font-medium text-gray-400 text-xs uppercase">Contacto</th>
                                <th className="px-6 py-4 font-medium text-gray-400 text-xs uppercase">Fecha Union</th>
                                <th className="px-6 py-4 font-medium text-gray-400 text-xs uppercase text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                                {user.name.charAt(0)}
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
                                            <p className="flex items-center gap-1"><Phone size={12} /> {user.phone}</p>
                                            <p className={`flex items-center gap-1 ${user.status === 'Activo' ? 'text-green-500' : 'text-orange-400'}`}>
                                                <ShieldCheck size={12} /> {user.status}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-gray-500">
                                        <div className="flex items-center gap-2"><CalendarIcon size={14} /> {user.joined}</div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="text-gray-400 hover:text-primary transition-colors p-2">
                                            <MoreVertical size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-20 text-gray-400">
                            No se encontraron usuarios que coincidan con la búsqueda.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
