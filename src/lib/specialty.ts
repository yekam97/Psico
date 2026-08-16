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

// Plan module keys. Kept as plain strings (not an enum) since Plan.modules
// is a free-form Postgres text array — this is just the set the app
// currently knows how to gate something behind.
export const PLAN_MODULES = {
    // Patients/professionals created under this plan get real portal login
    // accounts. Without it, admin can still create PATIENT/PSYCHOLOGIST
    // records (for note-taking/organization) but those accounts can't log
    // in — see User.portalAccess.
    PORTAL_ACCESS: "PORTAL_ACCESS",
    // Odontogram clinical module (DENTISTRY/ORTHODONTICS companies only).
    ODONTOGRAM: "ODONTOGRAM",
    // Internal chat widget between roles.
    CHAT: "CHAT",
} as const;

export const PLAN_MODULE_LABELS: Record<string, string> = {
    PORTAL_ACCESS: "Acceso al portal (pacientes y profesionales)",
    ODONTOGRAM: "Odontograma",
    CHAT: "Chat interno",
};

export function isDentalSpecialty(specialty?: string | null): boolean {
    return !!specialty && DENTAL_SPECIALTIES.includes(specialty as Specialty);
}

/**
 * Whether a company's plan includes a given module (e.g. "ODONTOGRAM").
 * `modules === null` means the company has no plan assigned, which is
 * deliberately treated as unlimited/all-modules (see src/lib/specialty.ts
 * usage in the branding route) so existing companies aren't broken by
 * introducing the plan system.
 */
export function hasModule(modules: string[] | null | undefined, moduleKey: string): boolean {
    return modules === null || modules === undefined || modules.includes(moduleKey);
}

export function specialtyLabel(specialty?: string | null): string {
    if (!specialty) return "Salud";
    return SPECIALTY_LABELS[specialty as Specialty] || specialty;
}

export function professionalLabel(specialty?: string | null): string {
    if (!specialty) return "Profesional";
    return PROFESSIONAL_LABELS[specialty as Specialty] || "Profesional";
}
