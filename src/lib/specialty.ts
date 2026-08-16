// Shared specialty metadata used both server-side (API responses, seeding)
// and client-side (labels, conditional UI). Keep in sync with the
// `Specialty` enum in prisma/schema.prisma.
export const SPECIALTIES = [
    "PSYCHOLOGY",
    "DENTISTRY",
    "ORTHODONTICS",
    "INTERNAL_MEDICINE",
    "PEDIATRICS",
    "ANESTHESIOLOGY",
    "GYNECOLOGY_OBSTETRICS",
    "GENERAL_SURGERY",
] as const;

export type Specialty = (typeof SPECIALTIES)[number];

// Specialties whose clinical documentation is the tooth chart (odontogram)
// instead of free-text notes.
export const DENTAL_SPECIALTIES: Specialty[] = ["DENTISTRY", "ORTHODONTICS"];

export const SPECIALTY_LABELS: Record<Specialty, string> = {
    PSYCHOLOGY: "Psicología",
    DENTISTRY: "Odontología",
    ORTHODONTICS: "Ortodoncia",
    INTERNAL_MEDICINE: "Medicina Interna",
    PEDIATRICS: "Pediatría",
    ANESTHESIOLOGY: "Anestesiología",
    GYNECOLOGY_OBSTETRICS: "Ginecología y Obstetricia",
    GENERAL_SURGERY: "Cirugía General",
};

// What to call the professional (PSYCHOLOGIST role) in this specialty's UI.
export const PROFESSIONAL_LABELS: Record<Specialty, string> = {
    PSYCHOLOGY: "Psicólogo",
    DENTISTRY: "Odontólogo",
    ORTHODONTICS: "Ortodoncista",
    INTERNAL_MEDICINE: "Médico",
    PEDIATRICS: "Pediatra",
    ANESTHESIOLOGY: "Anestesiólogo",
    GYNECOLOGY_OBSTETRICS: "Ginecólogo",
    GENERAL_SURGERY: "Cirujano",
};

export function isDentalSpecialty(specialty?: string | null): boolean {
    return !!specialty && DENTAL_SPECIALTIES.includes(specialty as Specialty);
}

export function specialtyLabel(specialty?: string | null): string {
    if (!specialty) return "Salud";
    return SPECIALTY_LABELS[specialty as Specialty] || specialty;
}

export function professionalLabel(specialty?: string | null): string {
    if (!specialty) return "Profesional";
    return PROFESSIONAL_LABELS[specialty as Specialty] || "Profesional";
}
