"use client";

import { useSession } from "next-auth/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import {
    Calendar as CalendarIcon,
    Clock,
    Users,
    CheckCircle,
    Video,
    MapPin,
    ChevronRight,
    ArrowRight
} from "lucide-react";

export default function PsychologistDashboard() {
    const { data: session } = useSession();

    // Mock stats for demonstration
    const stats = [
        { label: "Citas Hoy", value: "8", icon: CalendarIcon, color: "text-secondary", bg: "bg-secondary/10" },
        { label: "Pacientes", value: "24", icon: Users, color: "text-tertiary", bg: "bg-tertiary/10" },
        { label: "Pendientes", value: "3", icon: Clock, color: "text-primary", bg: "bg-primary/5" },
        { label: "Completadas", value: "85%", icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
    ];

    // Mock events for demonstration
    const events = [
        {
            id: "1",
            title: "Cita: Juan Pérez",
            start: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
            end: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
            extendedProps: { type: "VIRTUAL", patient: "Juan Pérez", meetLink: "https://meet.google.com/abc-defg-hij" }
        },
        {
            id: "2",
            title: "Cita: Maria Garcia",
            start: new Date(new Date().setHours(11, 30, 0, 0)).toISOString(),
            end: new Date(new Date().setHours(12, 30, 0, 0)).toISOString(),
            extendedProps: { type: "IN_PERSON", patient: "Maria Garcia" }
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Welcome Card */}
                <div className="lg:col-span-2 flex-1 bg-white p-10 rounded-[3rem] shadow-xl border border-secondary/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    <h1 className="text-4xl font-light text-primary relative z-10">Hola, <span className="italic font-normal">Dr. Roberto</span></h1>
                    <p className="text-gray-500 mt-2 relative z-10">Tienes 3 citas pendientes para hoy. El bienestar de tus pacientes te espera.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-start justify-between">
                            <div className={`p-2 rounded-full ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <p className="text-gray-500 text-sm mt-4">{stat.label}</p>
                            <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar Column */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-light flex items-center gap-3">
                            <CalendarIcon className="text-primary" /> Agenda Semanal
                        </h2>
                    </div>
                    <div className="calendar-container">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="timeGridWeek"
                            headerToolbar={{
                                left: "prev,next today",
                                center: "title",
                                right: "timeGridWeek,timeGridDay"
                            }}
                            events={events}
                            locale={esLocale}
                            allDaySlot={false}
                            slotMinTime="07:00:00"
                            slotMaxTime="20:00:00"
                            height="auto"
                            slotLabelFormat={{
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            }}
                            eventContent={(eventInfo) => (
                                <div className={`p-2 rounded-xl text-xs overflow-hidden ${eventInfo.event.extendedProps.type === 'VIRTUAL'
                                    ? 'bg-primary/20 border-l-4 border-primary text-primary-dark'
                                    : 'bg-sage/20 border-l-4 border-sage text-sage-dark'
                                    }`}>
                                    <div className="font-bold">{eventInfo.timeText}</div>
                                    <div className="truncate font-medium">{eventInfo.event.extendedProps.patient}</div>
                                    <div className="flex items-center gap-1 mt-1 opacity-70">
                                        {eventInfo.event.extendedProps.type === 'VIRTUAL' ? <Video size={10} /> : <MapPin size={10} />}
                                        {eventInfo.event.extendedProps.type === 'VIRTUAL' ? 'Virtual' : 'Presencial'}
                                    </div>
                                </div>
                            )}
                        />
                    </div>
                </div>

                {/* Sidebar Info/Upcoming */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <h3 className="text-xl font-light mb-6">Próximas Citas</h3>
                        <div className="space-y-4">
                            {events.map((event) => (
                                <div key={event.id} className="p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-primary/20 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                                            {event.extendedProps.type}
                                        </span>
                                        <Clock className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <p className="font-medium text-gray-800">{event.extendedProps.patient}</p>
                                    <p className="text-xs text-gray-500 mt-1">Hoy, 09:00 - 10:00 AM</p>

                                    {event.extendedProps.type === 'VIRTUAL' && (
                                        <a
                                            href={event.extendedProps.meetLink}
                                            target="_blank"
                                            className="mt-4 flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-xl text-xs hover:bg-primary-dark transition-all"
                                        >
                                            <Video size={14} /> Entrar a Meet
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 text-primary text-sm font-medium flex items-center justify-center gap-2 hover:underline">
                            Ver todas <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="bg-sage/10 p-8 rounded-[2.5rem] border border-sage/20">
                        <h3 className="text-xl font-light mb-4 text-sage-dark">Tip de Bienestar</h3>
                        <p className="text-sm text-sage-dark/80 leading-relaxed italic">
                            "Recuerda que agendar 10 minutos entre sesiones ayuda a reducir la fatiga cognitiva y mejorar la atención en cada paciente."
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        .fc { --fc-border-color: #f3f4f6; --fc-today-bg-color: #f7faf9; }
        .fc-header-toolbar { margin-bottom: 2rem !important; }
        .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 300 !important; }
        .fc-button-primary { 
          background-color: transparent !important; 
          border: 1px solid #e5e7eb !important; 
          color: #374151 !important;
          border-radius: 0.75rem !important;
          padding: 0.5rem 1rem !important;
          font-size: 0.875rem !important;
          text-transform: capitalize !important;
        }
        .fc-button-primary:hover { background-color: #f9fafb !important; }
        .fc-button-active { background-color: #5d8aa8 !important; color: white !important; border-color: #5d8aa8 !important; }
        .fc-timegrid-slot { height: 4rem !important; }
      `}</style>
        </div>
    );
}
