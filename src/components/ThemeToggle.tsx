"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        console.log("[ThemeToggle] theme changed:", theme);
        console.log("[ThemeToggle] resolvedTheme:", resolvedTheme);
        console.log("[ThemeToggle] html classList:", document.documentElement.classList.toString());
    }, [theme, resolvedTheme]);

    if (!mounted) {
        return (
            <div className={`flex items-center gap-1 p-1 rounded-full bg-gray-100 dark:bg-gray-800 ${className}`}>
                <div className="w-8 h-8" />
                <div className="w-8 h-8" />
                <div className="w-8 h-8" />
            </div>
        );
    }

    const options = [
        { value: "light", icon: Sun, label: "Claro" },
        { value: "dark", icon: Moon, label: "Oscuro" },
        { value: "system", icon: Monitor, label: "Sistema" },
    ];

    console.log("[ThemeToggle] Current theme:", theme);

    return (
        <div className={`flex items-center gap-1 p-1 rounded-full bg-gray-100 dark:bg-gray-700 ${className}`}>
            {options.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => {
                        console.log("[ThemeToggle] Clicked:", value);
                        console.log("[ThemeToggle] Before setTheme, current:", theme);
                        setTheme(value);
                        console.log("[ThemeToggle] After setTheme called");
                    }}
                    className={`p-2 rounded-full transition-all ${
                        theme === value
                            ? "bg-white dark:bg-gray-600 text-primary shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    }`}
                    title={label}
                    aria-label={label}
                >
                    <Icon className="w-4 h-4" />
                </button>
            ))}
        </div>
    );
}
