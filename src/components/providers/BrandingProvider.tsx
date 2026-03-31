"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

export interface BrandingConfig {
    name: string;
    logoUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
}

const DEFAULT_BRANDING: BrandingConfig = {
    name: "HealthSaaS",
    logoUrl: null,
    primaryColor: "#24343B",
    secondaryColor: "#EBA554",
    tertiaryColor: "#948472"
};

const BrandingContext = createContext<{
    branding: BrandingConfig;
    refreshBranding: () => Promise<void>;
}>({
    branding: DEFAULT_BRANDING,
    refreshBranding: async () => { }
});

export function BrandingProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);

    const fetchBranding = async () => {
        try {
            const res = await axios.get("/api/branding");
            const data = res.data;
            setBranding({
                name: data.name || DEFAULT_BRANDING.name,
                logoUrl: data.logoUrl || null,
                primaryColor: data.primaryColor || DEFAULT_BRANDING.primaryColor,
                secondaryColor: data.secondaryColor || DEFAULT_BRANDING.secondaryColor,
                tertiaryColor: data.tertiaryColor || DEFAULT_BRANDING.tertiaryColor
            });
        } catch (e) {
            console.warn("Could not fetch company branding, using defaults.", e);
        }
    };

    // Fetch when session is ready
    useEffect(() => {
        if (status === "authenticated") {
            fetchBranding();
        }
    }, [status]);

    // Apply CSS variables to :root on every branding change
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty("--color-primary", branding.primaryColor);
        root.style.setProperty("--color-secondary", branding.secondaryColor);
        root.style.setProperty("--color-tertiary", branding.tertiaryColor);

        // Compute light/dark shades automatically (+15% lightness, -15% lightness)
        root.style.setProperty("--color-primary-light", lighten(branding.primaryColor, 20));
        root.style.setProperty("--color-primary-dark", darken(branding.primaryColor, 15));
        root.style.setProperty("--color-secondary-light", lighten(branding.secondaryColor, 20));
        root.style.setProperty("--color-secondary-dark", darken(branding.secondaryColor, 15));
    }, [branding]);

    return (
        <BrandingContext.Provider value={{ branding, refreshBranding: fetchBranding }}>
            {children}
        </BrandingContext.Provider>
    );
}

export function useBranding() {
    return useContext(BrandingContext);
}

// --- Color utility helpers ---

function hexToHsl(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function lighten(hex: string, amount: number): string {
    try {
        const [h, s, l] = hexToHsl(hex);
        return hslToHex(h, s, Math.min(100, l + amount));
    } catch { return hex; }
}

function darken(hex: string, amount: number): string {
    try {
        const [h, s, l] = hexToHsl(hex);
        return hslToHex(h, s, Math.max(0, l - amount));
    } catch { return hex; }
}
