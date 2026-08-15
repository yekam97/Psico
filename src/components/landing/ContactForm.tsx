"use client";

import { useState } from "react";

const CONTACT_EMAIL = "hola@healthsaas.com";

export default function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // No email-sending service (Resend/nodemailer/etc.) is configured in this
        // project, so we can't dispatch the message from the server. Instead we
        // hand the visitor off to their own mail client with everything prefilled,
        // which is the one form of "sending an email" that needs no backend or
        // API key at all.
        const subject = encodeURIComponent(`Solicitud de contacto de ${name || "un visitante"}`);
        const body = encodeURIComponent(
            `Nombre: ${name}\nCorreo: ${email}\n\n${message}`
        );

        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-2xl text-primary font-bold">Solicitar contacto</h3>
            <div className="grid grid-cols-1 gap-4">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre completo"
                    required
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo electrónico"
                    required
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Cuéntanos sobre tu centro"
                    rows={4}
                    required
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                    type="submit"
                    className="w-full bg-secondary text-primary-dark py-5 rounded-2xl font-bold hover:bg-secondary-light hover:shadow-lg transition-all"
                >
                    Enviar solicitud
                </button>
            </div>
            <p className="text-center text-[10px] text-gray-400">Al enviar tus datos, aceptas nuestras políticas de privacidad.</p>
        </form>
    );
}
