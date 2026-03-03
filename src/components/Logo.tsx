"use client";

import { Activity } from "lucide-react";
import Link from "next/link";

interface LogoProps {
    variant?: "imagotipo" | "isotipo";
    theme?: "light" | "dark";
    className?: string;
    brandName?: string;
    brandSubtitle?: string;
}

export default function Logo({
    variant = "imagotipo",
    theme = "light",
    className = "",
    brandName = "HealthSaaS",
    brandSubtitle = "Centro de Salud"
}: LogoProps) {
    const isDark = theme === "dark";
    const primaryColor = isDark ? "text-white" : "text-primary";
    const secondaryColor = "text-secondary";

    const GenericIcon = () => (
        <div className={`relative flex items-center justify-center ${isDark ? "bg-white/5" : "bg-primary/5"} p-1 rounded-full`}>
            <div className={`w-10 h-10 rounded-full border border-current flex items-center justify-center relative ${primaryColor}`}>
                <Activity size={20} />
            </div>
        </div>
    );

    if (variant === "isotipo") {
        return (
            <Link href="/" className={`inline-flex items-center justify-center relative w-24 h-24 rounded-full border border-current ${primaryColor} ${className}`}>
                <div className="absolute top-2 text-[8px] font-bold tracking-widest uppercase truncate max-w-[60px]">{brandName}</div>
                <GenericIcon />
                <div className="absolute bottom-2 text-[6px] font-medium tracking-tight uppercase max-w-[50px] text-center leading-[0.8]">
                    {brandSubtitle}
                </div>
            </Link>
        );
    }

    return (
        <Link href="/" className={`inline-flex items-center gap-3 ${className} group`}>
            <GenericIcon />
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold tracking-[0.05em] ${primaryColor} font-serif leading-none uppercase`}>
                        {brandName}
                    </span>
                </div>
                <div className={`flex items-center gap-1.5 ${secondaryColor}`}>
                    <span className="text-[9px] font-bold tracking-[0.15em] uppercase whitespace-nowrap">
                        {brandSubtitle}
                    </span>
                </div>
            </div>
        </Link>
    );
}
