"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import {
    Heart,
    Target,
    ShieldCheck,
    Sparkles,
    Zap,
    Lock,
    BarChart
} from "lucide-react";

export default function AboutPage() {
    return (
        <div className="bg-white min-h-screen">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-8 py-6 md:px-16 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <Logo brandSubtitle="Management" />
                <div className="flex gap-8 items-center text-sm font-medium text-gray-500">
                    <Link href="/about" className="text-primary font-bold">Nosotros</Link>
                    <Link href="/login" className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary-dark transition-all">Ingresar</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-24 px-8 max-w-7xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                    <Sparkles size={14} /> Nuestra Propósito
                </div>
                <h1 className="text-5xl md:text-7xl font-light text-gray-900 leading-tight max-w-4xl mx-auto">
                    Tecnología que cuida a <span className="italic text-primary">quienes cuidan.</span>
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    HealthSaaS nació para eliminar la carga administrativa de los psicólogos y centros de salud mental, permitiéndoles enfocar toda su energía en el bienestar de sus pacientes.
                </p>
            </section>

            {/* Values Grid */}
            <section className="py-20 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="p-10 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 hover:border-primary/20 transition-all group">
                        <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                            <Zap size={32} />
                        </div>
                        <h3 className="text-2xl font-light text-primary mb-4">Eficiencia Operativa</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">Optimizamos tu flujo de trabajo reduciendo el tiempo dedicado a tareas administrativas en un 40%.</p>
                    </div>
                    <div className="p-10 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 hover:border-secondary/20 transition-all group">
                        <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
                            <Lock size={32} />
                        </div>
                        <h3 className="text-2xl font-light text-primary mb-4">Seguridad Total</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">Tus historias clínicas están protegidas con los más altos estándares de cifrado y cumplimiento legal.</p>
                    </div>
                    <div className="p-10 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 hover:border-tertiary/20 transition-all group">
                        <div className="w-16 h-16 bg-tertiary/10 rounded-2xl flex items-center justify-center text-tertiary mb-6 group-hover:scale-110 transition-transform">
                            <BarChart size={32} />
                        </div>
                        <h3 className="text-2xl font-light text-primary mb-4">Escalabilidad</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">Hecho para crecer contigo. Desde consultorios independientes hasta redes de centros internacionales.</p>
                    </div>
                </div>
            </section>

            {/* Why HealthSaaS Section */}
            <section className="py-32 px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-20 items-center">
                    <div className="flex-1 space-y-8">
                        <h2 className="text-4xl font-light text-gray-900 leading-tight">Por qué los mejores especialistas eligen <span className="italic">HealthSaaS</span></h2>
                        <div className="space-y-6">
                            {[
                                { title: "Enfoque en el paciente", desc: "Digitalizamos procesos para que la atención humana sea siempre la prioridad." },
                                { title: "Simple e intuitivo", desc: "Sin curvas de aprendizaje complejas. Todo funciona como lo esperas." },
                                { title: "Soporte Local", desc: "Acompañamos a nuestros clientes con un equipo humano real disponible 24/7." }
                            ].map((item, id) => (
                                <div key={id} className="flex gap-4">
                                    <div className="mt-1"><Target className="text-primary" size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                                        <p className="text-gray-500 text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 bg-primary p-12 rounded-[4rem] text-white space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
                        <h3 className="text-3xl font-light italic">"Nuestra visión es ser la infraestructura digital de la salud mental en Latinoamérica."</h3>
                        <p className="text-white/50 text-sm">— El Equipo de HealthSaaS</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-white px-8">
                <div className="max-w-4xl mx-auto bg-gray-900 text-white p-12 md:p-20 rounded-[3rem] shadow-2xl relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full -ml-20 -mt-20 blur-3xl opacity-50" />
                    <h2 className="text-3xl md:text-5xl font-light mb-10">Únete a la nueva era de la <span className="text-secondary">gestión psicológica.</span></h2>
                    <Link href="/#contacto" className="bg-primary text-white px-12 py-5 rounded-2xl font-bold hover:bg-primary-dark transition-all inline-block shadow-lg">
                        Prueba Gratuita
                    </Link>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-12 px-8 border-t border-gray-50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
                    <Logo theme="light" variant="isotipo" brandSubtitle="Management" />
                    <div className="flex gap-8 text-xs font-bold uppercase tracking-[0.2em]">
                        <Link href="/" className="hover:text-primary">Inicio</Link>
                        <Link href="/privacy" className="hover:text-primary">Privacidad</Link>
                    </div>
                    <p className="text-[10px] tracking-widest uppercase text-center md:text-right">© 2026 HealthSaaS Group. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
