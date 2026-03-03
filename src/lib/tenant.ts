export interface TenantBranding {
    name: string;
    subtitle: string;
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
    logoVariant: "imagotipo" | "isotipo";
}

const DEFAULT_BRANDING: TenantBranding = {
    name: "HealthSaaS",
    subtitle: "Plataforma de Salud",
    primaryColor: "#24343B",
    secondaryColor: "#EBA554",
    tertiaryColor: "#948472",
    logoVariant: "imagotipo"
};

const MINERVA_BRANDING: TenantBranding = {
    name: "Minerva",
    subtitle: "Centro de Psicología",
    primaryColor: "#24343B",
    secondaryColor: "#EBA554",
    tertiaryColor: "#948472",
    logoVariant: "imagotipo"
};

export function getTenantBranding(companyId: string | null): TenantBranding {
    if (!companyId) return DEFAULT_BRANDING;

    // In a real app, this would fetch from a database using companyId
    // For this prototype, we'll derive some info if companyId looks like a domain
    if (companyId === "minerva-default-id" || companyId === "minerva") {
        return MINERVA_BRANDING;
    }

    // Dynamic fallback for new companies
    return {
        ...DEFAULT_BRANDING,
        name: companyId.charAt(0).toUpperCase() + companyId.slice(1), // Capitalize domain
        subtitle: `Centro de Salud ${companyId.charAt(0).toUpperCase() + companyId.slice(1)}`
    };
}

export function resolveCompanyFromEmail(email: string): { domain: string, name: string } {
    const domainPart = email.split('@')[1];
    if (!domainPart) return { domain: "generic", name: "Generic" };

    const domain = domainPart.split('.')[0]; // "minerva" from "admin@minerva.com"
    return {
        domain: domain,
        name: domain.charAt(0).toUpperCase() + domain.slice(1)
    };
}
