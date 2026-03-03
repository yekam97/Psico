"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import {
    Users,
    Baby,
    User,
    Video,
    MapPin,
    ArrowRight,
    CheckCircle2,
    Calendar as CalendarIcon,
    Sparkles
} from "lucide-react";

export default function ServicesPage() {
    const services = [
        {
            title: "Terapia Individual",
            desc: "Un espacio seguro para explorar tus emociones y superar desafíos personales con acompañamiento profesional.",
            icon: <User size={32} className="text-primary" />,
            features: ["Manejo de ansiedad", "Depresión y duelo", "Crecimiento personal", "Autoestima"],
            price: "$120.000 / sesión",
            id: "individual"
        },
        {
            title: "Terapia de Pareja",
            desc: "Mejora la comunicación y resuelve conflictos en un espacio neutral orientado al crecimiento mutuo.",
            icon: <Users size={32} className="text-purple-500" />,
            features: ["Comunicación asertiva", "Infidelidad", "Proyectos de vida", "Resolución de conflictos"],
            price: "$150.000 / sesión",
            id: "couple"
        },
        {
            title: "Psicoterapia Infantil",
            desc: "Apoyamos el desarrollo emocional de los más pequeños a través del juego y técnicas especializadas.",
            icon: <Baby size={32} className="text-secondary" />,
            features: ["Problemas de conducta", "Dificultades escolares", "Manejo de emociones", "TDAH"],
            price: "$130.000 / sesión",
            id: "child"
        }
    ];

    return (
        <div className="bg-white min-h-screen">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-8 py-6 md:px-16 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <Logo />
                <div className="flex gap-8 items-center text-sm font-medium text-gray-500">
                    <Link href="/services" className="text-primary">Servicios</Link>
                    <Link href="/about" className="hover:text-primary transition-colors">Nosotros</Link>
                    <Link href="/login" className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary-dark transition-all">Ingresar</Link>
                </div>
            </nav>

            <section className="py-24 px-8 max-w-7xl mx-auto space-y-20">
                <div className="max-w-3xl space-y-6">
                    <h1 className="text-5xl md:text-6xl font-light text-gray-900 leading-tight">
                        Nuestros <span className="text-primary italic">Servicios Especializados</span>
                    </h1>
                    <p className="text-xl text-gray-500 leading-relaxed">
                        Ofrecemos diversas modalidades de atención para adaptarnos a tus necesidades específicas, garantizando siempre el más alto estándar ético y profesional.
                    </p>
                </div>

                {/* Services Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {services.map((service) => (
                        <div key={service.id} className="p-10 rounded-[3rem] bg-gray-50 hover:bg-white hover:shadow-2xl transition-all border border-transparent hover:border-secondary/10 group flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-secondary group-hover:scale-110 transition-transform duration-500">
                                {service.icon}
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-light text-primary">{service.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{service.desc}</p>
                            </div>
                            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 w-full text-xs font-medium text-gray-400">
                                {service.features.map(f => (
                                    <li key={f} className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-secondary" /> {f}</li>
                                ))}
                            </ul>
                            <div className="w-full pt-6 mt-auto border-t border-gray-100 flex items-center justify-between">
                                <span className="text-primary font-bold">{service.price}</span>
                                <Link href={`/dashboard/patient/book?type=${service.id}`} className="text-secondary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                    Agendar <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Modalities Section */}
            <section className="bg-sage/5 py-32 px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
                    <div className="flex-1 space-y-12">
                        <h2 className="text-4xl font-light text-gray-900">Modalidades de Atención</h2>
                        <div className="grid grid-cols-1 gap-8">
                            <div className="flex items-start gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm">
                                <div className="w-12 h-12 bg-blue-50 flex items-center justify-center text-blue-500 rounded-xl"><Video size={24} /></div>
                                <div>
                                    <h4 className="text-xl font-medium">Consulta Virtual</h4>
                                    <p className="text-sm text-gray-500 mt-1">Sesiones vía Google Meet con la misma calidad y privacidad que la consulta física.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm">
                                <div className="w-12 h-12 bg-purple-50 flex items-center justify-center text-purple-500 rounded-xl"><MapPin size={24} /></div>
                                <div>
                                    <h4 className="text-xl font-medium">Consulta Presencial</h4>
                                    <p className="text-sm text-gray-500 mt-1">Visítanos en nuestra sede principal ubicada en una zona residencial tranquila y central.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <div className="w-full aspect-square bg-white rounded-full border border-gray-100 shadow-inner flex items-center justify-center p-20 animate-pulse duration-[3000ms]">
                            <div className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center">
                                <Sparkles size={80} className="text-primary/20" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQs Placeholder */}
            <section className="py-32 px-8 max-w-4xl mx-auto text-center space-y-16">
                <h2 className="text-4xl font-light text-gray-900">Preguntas Frecuentes</h2>
                <div className="space-y-4 text-left">
                    {[
                        "¿Cuánto dura cada sesión?",
                        "¿Tienen convenio con medicinas prepagadas?",
                        "¿Puedo reprogramar mi cita?",
                        "¿Cómo funcionan las sesiones grupales?"
                    ].map((q, i) => (
                        <div key={i} className="group cursor-pointer border-b border-gray-50 py-6 flex justify-between items-center hover:px-4 transition-all hover:bg-gray-50/50 rounded-xl">
                            <span className="text-lg text-gray-600 font-medium">{q}</span>
                            <ArrowRight className="text-gray-300 group-hover:text-primary transition-colors" />
                        </div>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section className="pb-32 px-8 max-w-7xl mx-auto">
                <div className="bg-[#1a2b3b] p-16 md:p-24 rounded-[4rem] text-center text-white space-y-10">
                    <h2 className="text-4xl md:text-6xl font-light leading-tight">
                        Empezar hoy es la <span className="italic text-primary">mejor inversión.</span>
                    </h2>
                    <div className="flex flex-col md:flex-row justify-center gap-6">
                        <Link href="/login" className="bg-secondary text-primary-dark px-12 py-5 rounded-2xl font-bold hover:bg-secondary-light transition-all shadow-xl">Iniciar Sesión</Link>
                        <Link href="/about" className="bg-white/10 px-12 py-5 rounded-2xl font-bold border border-white/10 hover:bg-white/20 transition-all">Hablar con un asesor</Link>
                    </div>
                </div>
            </section>

            {/* Footer same as About */}
        </div>
    );
}
