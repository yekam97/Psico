"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, User, ChevronLeft } from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function ChatWidget() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<"contacts" | "chat">("contacts");
    const [contacts, setContacts] = useState<any[]>([]);
    const [selectedContact, setSelectedContact] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchContacts = async () => {
        try {
            const res = await axios.get("/api/chat/contacts");
            setContacts(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchMessages = async (contactId: string) => {
        try {
            const res = await axios.get(`/api/chat/messages?contactId=${contactId}`);
            setMessages(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchContacts();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedContact) {
            fetchMessages(selectedContact.id);
            const interval = setInterval(() => fetchMessages(selectedContact.id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedContact]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact) return;

        try {
            const res = await axios.post("/api/chat/messages", {
                receiverId: selectedContact.id,
                content: newMessage
            });
            setMessages([...messages, res.data]);
            setNewMessage("");
        } catch (e) {
            console.error(e);
        }
    };

    if (!session) return null;

    return (
        <div className="fixed bottom-8 right-8 z-[200]">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all group"
                >
                    <MessageSquare size={28} />
                    <span className="absolute right-full mr-4 bg-white text-gray-800 px-4 py-2 rounded-xl text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-100">
                        Chat de Soporte Interno
                    </span>
                </button>
            ) : (
                <div className="bg-white w-[350px] h-[500px] rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                    {/* Header */}
                    <div className="p-6 bg-primary text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            {view === "chat" && (
                                <button onClick={() => { setView("contacts"); setSelectedContact(null); }}>
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            <div>
                                <h4 className="font-bold text-sm">
                                    {view === "contacts" ? "Centro de Mensajería" : selectedContact.name}
                                </h4>
                                <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">
                                    {view === "contacts" ? "Contactos Disponibles" : selectedContact.role}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                        {view === "contacts" ? (
                            <div className="space-y-2">
                                {contacts.length === 0 ? (
                                    <p className="text-center text-gray-400 text-sm mt-20">No tienes contactos asignados aún.</p>
                                ) : (
                                    contacts.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => { setSelectedContact(c); setView("chat"); }}
                                            className="w-full flex items-center gap-3 p-3 bg-white rounded-2xl hover:bg-primary/5 transition-all text-left border border-gray-100 group"
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${c.role === 'ADMIN' ? 'bg-primary/10 text-primary' :
                                                    c.role === 'PSYCHOLOGIST' ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'
                                                }`}>
                                                {c.name?.charAt(0) || "U"}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-sm font-bold text-gray-800 truncate">{c.name}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">{c.role}</p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((m, i) => {
                                    const isMe = m.senderId === (session.user as any).id;
                                    return (
                                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${isMe ? 'bg-primary text-white rounded-tr-none shadow-lg' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'
                                                }`}>
                                                <p>{m.content}</p>
                                                <p className={`text-[9px] mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={scrollRef} />
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    {view === "chat" && (
                        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                            <input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Escribe un mensaje..."
                                className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/20"
                            />
                            <button
                                type="submit"
                                className="bg-primary text-white p-2 rounded-xl hover:bg-primary-dark transition-all shadow-md"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
