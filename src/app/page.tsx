import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";
import {
  Calendar,
  Search,
  ShieldCheck,
  Video,
  Users,
  FileText,
  MessageSquare,
  Mail,
  Phone
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fcfdfc] text-[#2c3e50] selection:bg-primary/20">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 md:px-16 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <Logo brandSubtitle="Gestión de Centros" />
        <div className="hidden space-x-8 md:flex items-center">
          <Link href="/about" className="hover:text-primary transition-colors font-medium">Nosotros</Link>
          <Link href="/login" className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition-all shadow-md font-bold">
            Acceso
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-8 md:px-16 pt-12 md:pt-24 pb-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
              Software para Psicólogos
            </div>
            <h1 className="text-5xl md:text-7xl font-light leading-tight text-gray-900">
              Gestiona tu centro con <span className="italic font-normal text-primary">inteligencia</span>.
            </h1>
            <p className="text-xl text-gray-600 max-w-xl leading-relaxed">
              HealthSaaS es el ecosistema digital diseñado para simplificar la administración de centros de psicología. Citas, historias clínicas y telemedicina en un solo lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/login" className="bg-primary text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-xl hover:translate-y-[-2px] hover:shadow-2xl transition-all text-center">
                Comenzar Gratis
              </Link>
              <Link href="#contacto" className="border border-gray-200 px-10 py-5 rounded-2xl text-lg font-medium hover:bg-gray-50 transition-all text-center">
                Solicitar Demo
              </Link>
            </div>
          </div>
          <div className="flex-1 relative animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="w-full aspect-square rounded-[4rem] overflow-hidden shadow-2xl skew-y-1 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent z-10" />
              <Image
                src="/psychology_hero_light_abstract.png"
                alt="HealthSaaS Dashboard Preview"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-xl flex items-center gap-4 border border-gray-100 animate-bounce transition-all duration-1000">
              <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Nueva Cita</p>
                <p className="text-sm font-bold">Dr. Roberto Casas</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Social Proof (Current Clients) */}
      <section className="bg-white py-20 border-y border-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-12">Centros que potencian su gestión con nosotros</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="text-2xl font-serif font-bold italic">Minerva</div>
            <div className="text-2xl font-serif font-bold">Briolight</div>
            <div className="text-2xl font-serif font-bold tracking-tighter">LOGYCA</div>
            <div className="text-2xl font-serif font-bold">PsicoRed</div>
          </div>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section className="px-8 md:px-16 py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl font-light text-gray-900">Todo lo que tu centro necesita</h2>
            <p className="text-gray-500">Herramientas diseñadas por profesionales de la salud para profesionales de la salud.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Agenda Médica",
                desc: "Gestión de citas con recordatorios automáticos y política de cancelación de 12 horas.",
                icon: <Calendar className="text-primary" size={32} />
              },
              {
                title: "Historias Clínicas",
                desc: "Registros digitales seguros, privados y accesibles desde cualquier lugar siguiendo normativas de salud.",
                icon: <FileText className="text-secondary" size={32} />
              },
              {
                title: "Telemedicina Integrada",
                desc: "Sesiones virtuales inmediatas con integración nativa de Google Meet sin configuraciones complejas.",
                icon: <Video className="text-tertiary" size={32} />
              }
            ].map((item, id) => (
              <div key={id} className="p-12 rounded-[3rem] bg-white shadow-sm hover:shadow-2xl transition-all border border-gray-100 hover:border-transparent group">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-light mb-4 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="px-8 md:px-16 py-32 bg-primary text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-6xl font-light leading-tight">
                Impulsa tu centro <span className="italic text-secondary">hoy mismo</span>.
              </h2>
              <p className="text-white/60 text-lg max-w-md">
                Agenda una breve llamada de 15 minutos para enseñarte cómo HealthSaaS puede ahorrarte hasta 5 horas semanales de gestión administrativa.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 text-white/80 hover:text-white transition-colors cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <Mail size={20} />
                  </div>
                  <span>hola@healthsaas.com</span>
                </div>
                <div className="flex items-center gap-4 text-white/80 hover:text-white transition-colors cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <Phone size={20} />
                  </div>
                  <span>+57 317 524 4453</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl relative">
              <div className="space-y-6">
                <h3 className="text-2xl text-primary font-bold">Solicitar contacto</h3>
                <div className="grid grid-cols-1 gap-4">
                  <input type="text" placeholder="Nombre completo" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all" />
                  <input type="email" placeholder="Correo electrónico" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all" />
                  <textarea placeholder="Cuéntanos sobre tu centro" rows={4} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all" />
                  <button className="w-full bg-secondary text-primary-dark py-5 rounded-2xl font-bold hover:bg-secondary-light hover:shadow-lg transition-all">
                    Enviar solicitud
                  </button>
                </div>
                <p className="text-center text-[10px] text-gray-400">Al enviar tus datos, aceptas nuestras políticas de privacidad.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-dark text-white py-12 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 opacity-60">
          <Logo theme="dark" variant="isotipo" brandSubtitle="Management" />
          <div className="flex gap-8 text-xs font-bold uppercase tracking-[0.2em]">
            <Link href="/about" className="hover:text-secondary whitespace-nowrap">Nosotros</Link>
            <Link href="/privacy" className="hover:text-secondary whitespace-nowrap">Privacidad</Link>
          </div>
          <p className="text-[10px] tracking-widest uppercase">© 2026 HealthSaaS Group. Bogotá, Colombia.</p>
        </div>
      </footer>
    </div>
  );
}
