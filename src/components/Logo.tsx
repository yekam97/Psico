"use client";

import Link from "next/link";

interface LogoProps {
    variant?: "imagotipo" | "isotipo";
    theme?: "light" | "dark";
    className?: string;
    brandName?: string;
    brandSubtitle?: string;
    logoUrl?: string;
}

export default function Logo({
    variant = "imagotipo",
    theme = "light",
    className = "",
    brandName = "HealthSaaS",
    brandSubtitle = "Centro de Salud",
    logoUrl
}: LogoProps) {
    const isDark = theme === "dark";
    const primaryColor = isDark ? "text-white" : "text-primary";
    const secondaryColor = isDark ? "text-secondary-light" : "text-secondary";

    // Own uploaded logo (Admin > Perfil): arbitrary aspect ratio, so it gets
    // a neutral circular badge. No custom logo set: fall back to the
    // HealthSaaS shield mark itself rather than a generic icon.
    const Mark = () => (
        logoUrl ? (
            <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-white border border-gray-100">
                <img src={logoUrl} alt={brandName} className="max-w-full max-h-full object-contain" />
            </div>
        ) : (
            <img src="/brand/icon.png" alt={brandName} className="w-10 h-10 shrink-0 object-contain" />
        )
    );

    if (variant === "isotipo") {
        return (
            <Link href="/" className={`inline-flex flex-col items-center justify-center gap-1 ${className}`}>
                <Mark />
                <div className={`text-[7px] font-bold tracking-widest uppercase truncate max-w-[70px] text-center ${primaryColor}`}>{brandName}</div>
            </Link>
        );
    }

    return (
        <Link href="/" className={`inline-flex items-center gap-3 ${className} group`}>
            <Mark />
            <div className="flex flex-col">
                <span className={`text-xl font-extrabold tracking-tight ${primaryColor} leading-none`}>
                    {brandName}
                </span>
                <span className={`text-[10px] font-semibold tracking-wide ${secondaryColor} whitespace-nowrap mt-0.5`}>
                    {brandSubtitle}
                </span>
            </div>
        </Link>
    );
}
