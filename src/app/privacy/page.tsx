"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { Shield, Lock, FileText, ArrowLeft, CheckCircle, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="bg-white min-h-screen">
            {/* Main Navigation */}
            <nav className="flex items-center justify-between px-8 py-6 md:px-16 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-50">
                <Logo />
                <div className="flex gap-8 items-center text-sm font-medium text-gray-500">
                    <Link href="/" className="flex items-center gap-2 hover:text-primary transition-colors">
                        <ArrowLeft size={16} /> Inicio
                    </Link>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto py-20 px-8 space-y-16 animate-in fade-in duration-700">
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                        <ShieldCheck size={14} /> Transparencia y Seguridad
                    </div>
                    <h1 className="text-4xl md:text-5xl font-light text-primary leading-tight">
                        Términos de Uso y <span className="italic">Privacidad</span>
                    </h1>
                    <p className="text-gray-400">Actualizado el: 2 de marzo de 2026</p>
                </div>

                <div className="space-y-12 text-gray-600 leading-relaxed">
                    <section className="space-y-4 text-center md:text-left">
                        <h2 className="text-2xl font-light text-primary flex items-center justify-center md:justify-start gap-3">
                            <FileText size={24} className="text-secondary" /> Consentimiento Informado
                        </h2>
                        <p>
                            Al utilizar nuestros servicios, el paciente acepta de manera voluntaria iniciar un proceso psicoterapéutico. Entiende que la terapia es un proceso colaborativo y que los resultados dependen del compromiso del paciente y del profesional.
                        </p>
                        <div className="bg-gray-50 p-8 rounded-[2rem] border-t-4 border-t-secondary space-y-4">
                            <p className="text-sm font-bold text-primary uppercase tracking-wider">Principios clave:</p>
                            <ul className="text-sm space-y-3 list-none">
                                <li className="flex gap-3">
                                    <CheckCircle size={14} className="text-secondary flex-shrink-0 mt-0.5" />
                                    <span><strong>Voluntariedad:</strong> Puedes interrumpir el tratamiento en cualquier momento.</span>
                                </li>
                                <li className="flex gap-3">
                                    <CheckCircle size={14} className="text-secondary flex-shrink-0 mt-0.5" />
                                    <span><strong>Secreto Profesional:</strong> Todo lo discutido es confidencial, salvo riesgo vital para el paciente o terceros.</span>
                                </li>
                                <li className="flex gap-3">
                                    <CheckCircle size={14} className="text-secondary flex-shrink-0 mt-0.5" />
                                    <span><strong>Honestidad:</strong> El terapeuta proporcionará retroalimentación clara sobre el diagnóstico y evolución.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-light text-primary flex items-center gap-3">
                            <Lock size={24} className="text-secondary" /> Protección de Datos
                        </h2>
                        <p className="max-w-xs text-sm text-white/50 leading-relaxed">
                            Plataforma de optimización para servicios digitales y presenciales de salud.
                        </p>
                        <p>
                            En cumplimiento con la Ley de Protección de Datos, garantizamos que la información clínica y personal es tratada con los más altos protocolos de seguridad digital.
                        </p>
                        <p>
                            Los datos almacenados en nuestra plataforma son cifrados de extremo a extremo. Los psicólogos solo tienen acceso a la historia clínica de los pacientes asignados a su agenda.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-light text-primary flex items-center gap-3">
                            <Shield size={24} className="text-secondary" /> Política de Cancelación
                        </h2>
                        <p>
                            Para garantizar la operatividad del centro y el respeto al tiempo del profesional, las citas solo pueden ser canceladas o reprogramadas con un mínimo de <strong>12 horas de antelación</strong>.
                        </p>
                    </section>
                </div>
                <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-sm text-gray-400">
                        ¿Tienes dudas sobre estos términos? <br />
                        Contáctanos en nuestro centro de atención legal.
                    </div>
                    <Link href="/login" className="bg-secondary text-primary-dark px-12 py-4 rounded-2xl font-bold hover:bg-secondary-light transition-all shadow-lg">
                        Entendido
                    </Link>
                </div>
            </div>

            <footer className="py-12 bg-primary text-white text-center text-xs opacity-50">
                © 2026. Cuidando tu salud mental con integridad.
            </footer>
        </div >
    );
}
