"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import {
    Heart,
    Target,
    Users,
    ArrowRight,
    ShieldCheck,
    Sparkles
} from "lucide-react";

export default function AboutPage() {
    return (
        <div className="bg-white min-h-screen">
            {/* Navigation (Simple version for public pages) */}
            <nav className="flex items-center justify-between px-8 py-6 md:px-16 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <Logo />
                <div className="flex gap-8 items-center text-sm font-medium text-gray-500">
                    <Link href="/services" className="hover:text-primary transition-colors">Servicios</Link>
                    <Link href="/about" className="text-primary">Nosotros</Link>
                    <Link href="/login" className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary-dark transition-all">Ingresar</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-24 px-8 max-w-7xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                    <Sparkles size={14} /> Nuestra Historia
                </div>
                <h1 className="text-5xl md:text-7xl font-light text-gray-900 leading-tight max-w-4xl mx-auto">
                    Cuidamos tu mente para que <span className="italic text-primary">vivas plenamente.</span>
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Nuestra plataforma nació con la misión de democratizar el acceso a la salud mental de alta calidad, combinando la calidez humana con herramientas tecnológicas modernas.
                </p>
            </section>

            {/* Values Grid */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="p-10 bg-white rounded-[2.5rem] shadow-xl border border-secondary/10 hover:border-secondary/30 transition-all group">
                        <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
                            <Heart size={32} />
                        </div>
                        <h3 className="text-2xl font-light text-primary mb-4">Empatía</h3>
                        <p className="text-gray-500 leading-relaxed">Entendemos que cada proceso es único. Escuchamos sin juicios para construir un espacio de confianza absoluta.</p>
                    </div>
                    <div className="bg-white p-12 rounded-[3rem] shadow-sm space-y-6">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <Target size={28} />
                        </div>
                        <h3 className="text-2xl font-medium">Profesionalismo</h3>
                        <p className="text-gray-500 leading-relaxed">Contamos con un equipo de especialistas certificados en diversas ramas de la psicología clínica contemporánea.</p>
                    </div>
                    <div className="bg-white p-12 rounded-[3rem] shadow-sm space-y-6">
                        <div className="w-14 h-14 bg-tertiary/10 rounded-2xl flex items-center justify-center text-tertiary">
                            <ShieldCheck size={28} />
                        </div>
                        <h3 className="text-2xl font-medium">Confidencialidad</h3>
                        <p className="text-gray-500 leading-relaxed">Tu privacidad es nuestra prioridad. Utilizamos los más altos estándares de protección de datos personales.</p>
                    </div>
                </div>
            </section>

            {/* Team Section Placeholder */}
            <section className="py-32 px-8 max-w-7xl mx-auto space-y-16">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                    <div className="max-w-xl space-y-4">
                        <h2 className="text-4xl font-light text-gray-900">Expertos Comprometidos</h2>
                        <p className="text-gray-500">Un equipo multidisciplinario listo para acompañarte en cada paso de tu camino hacia el bienestar emocional.</p>
                    </div>
                    <Link href="/dashboard/patient/book" className="text-primary font-semibold flex items-center gap-2 group">
                        Ver disponibilidad de especialistas <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-4 group cursor-pointer">
                            <div className="aspect-[4/5] bg-gray-100 rounded-[2rem] overflow-hidden">
                                <div className="w-full h-full bg-primary/5 group-hover:bg-primary/10 transition-colors flex items-center justify-center text-primary/20">
                                    <Users size={64} />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xl font-medium text-gray-900">Dr. Especialista {i}</h4>
                                <p className="text-sm text-gray-500">Psicología Clínica</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto bg-primary text-white p-16 rounded-[3rem] shadow-2xl relative overflow-hidden text-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                    <h2 className="text-4xl font-light mb-8">¿Listo para dar el primer paso?</h2>
                    <Link href="/login" className="bg-secondary text-primary-dark px-12 py-5 rounded-2xl font-bold hover:bg-secondary-light transition-all inline-block shadow-lg">
                        Agendar mi primera cita
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-primary text-white py-20 px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 opacity-80">
                    <div className="col-span-2 space-y-6">
                        <Logo theme="dark" variant="isotipo" />
                        <p className="max-w-xs text-sm text-white/50 leading-relaxed">
                            El centro de psicología líder en servicios digitales y presenciales del país.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h5 className="font-bold text-xs uppercase tracking-widest text-secondary">Plataforma</h5>
                        <ul className="text-sm space-y-2 text-white/40">
                            <li><Link href="/login" className="hover:text-secondary">Ingresar</Link></li>
                            <li><Link href="/dashboard/patient/book" className="hover:text-secondary">Agendar Cita</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h5 className="font-bold text-xs uppercase tracking-widest text-secondary">Legal</h5>
                        <ul className="text-sm space-y-2 text-white/40">
                            <li><Link href="/privacy" className="hover:text-secondary">Privacidad</Link></li>
                            <li><Link href="/privacy" className="hover:text-secondary">Términos</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-white/10 text-center text-xs text-white/30">
                    © 2026. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    );
}
