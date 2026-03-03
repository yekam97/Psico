import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fcfdfc] text-[#2c3e50] selection:bg-primary/20">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 md:px-16">
        <Logo />
        <div className="hidden space-x-8 md:flex items-center">
          <Link href="/about" className="hover:text-primary transition-colors">Nosotros</Link>
          <Link href="/services" className="hover:text-primary transition-colors">Servicios</Link>
          <Link href="/login" className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition-all shadow-md">
            Iniciar Sesión
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-8 md:px-16 pt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <h1 className="text-5xl md:text-7xl font-light leading-tight">
              Bienestar emocional a tu <span className="italic font-normal text-secondary">alcance</span>.
            </h1>
            <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
              Reserva tu cita con profesionales certificados. Modalidad presencial o virtual con integración de video inmediata.
            </p>
            <div className="flex gap-4">
              <Link href="/login" className="bg-primary-dark text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-lg hover:translate-y-[-2px] hover:shadow-xl transition-all">
                Agendar Cita
              </Link>
              <Link href="/services" className="border border-gray-200 px-8 py-4 rounded-2xl text-lg font-medium hover:bg-gray-50 transition-all">
                Ver Especialidades
              </Link>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="w-full h-[500px] rounded-[3rem] overflow-hidden shadow-2xl skew-y-1">
              <Image
                src="/psychology_hero_light_abstract.png"
                alt="Psicología Bienestar"
                fill
                className="object-cover"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-sage/20 rounded-full blur-3xl" />
          </div>
        </div>
      </main>

      {/* Quick Access Grid */}
      <section className="px-8 md:px-16 py-24 bg-white mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Terapia Individual", desc: "Espacio seguro para tu crecimiento personal." },
            { title: "Terapia de Pareja", desc: "Fortaleciendo vínculos y comunicación." },
            { title: "Terapia Infantil", desc: "Acompañamiento especializado para los más pequeños." }
          ].map((item, id) => (
            <div key={id} className="p-10 rounded-[2.5rem] bg-gray-50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-secondary/20 group cursor-pointer border-t-4 border-t-secondary/10 hover:border-t-secondary">
              <h3 className="text-2xl font-light mb-4 group-hover:text-primary transition-colors">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
