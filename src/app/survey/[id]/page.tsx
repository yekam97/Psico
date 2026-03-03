"use client";

import { useState } from "react";
import { Star, MessageSquare, Send, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SurveyPage({ params }: { params: { id: string } }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-8 animate-in zoom-in duration-500">
                <div className="max-w-md w-full bg-sage/5 p-12 rounded-[4rem] text-center space-y-8 border border-sage/10 shadow-xl">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={40} className="text-primary" />
                    </div>
                    <h2 className="text-3xl font-light text-gray-900">¡Gracias por tu apoyo!</h2>
                    <p className="text-gray-500 leading-relaxed">
                        Tu opinión nos ayuda a mejorar y a brindarte un mejor servicio en cada sesión.
                    </p>
                    <div className="pt-8">
                        <Link href="/" className="bg-primary text-white px-10 py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all">
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
            <div className="max-w-2xl w-full bg-white p-16 rounded-[4rem] shadow-2xl space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                        <Sparkles size={14} /> Tu experiencia nos importa
                    </div>
                    <h1 className="text-4xl font-light text-gray-900">Encuesta de Satisfacción</h1>
                    <p className="text-gray-500">¿Cómo calificarías tu sesión de hoy con nosotros?</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Star Rating */}
                    <div className="flex justify-center gap-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="transition-all transform hover:scale-125 focus:outline-none"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                            >
                                <Star
                                    size={48}
                                    className={`${(hover || rating) >= star ? "fill-primary text-primary" : "text-gray-200"
                                        } transition-colors`}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Feedback Textarea */}
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <MessageSquare size={16} /> Comentarios adicionales (opcional)
                        </label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="¿Qué fue lo que más te gustó? ¿Algo que podamos mejorar?"
                            className="w-full h-32 p-6 bg-gray-50 rounded-[2rem] border border-transparent focus:bg-white focus:border-primary/20 outline-none transition-all resize-none shadow-inner"
                        />
                    </div>

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            disabled={rating === 0}
                            className="w-full bg-gray-900 text-white py-5 rounded-[2.5rem] font-bold shadow-xl hover:bg-primary transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                        >
                            <Send size={20} /> Enviar Valoración
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-xs text-gray-400 italic">
                        Esta encuesta es confidencial y solo se utiliza con fines de mejora del centro.
                    </p>
                </div>
            </div>
        </div>
    );
}
