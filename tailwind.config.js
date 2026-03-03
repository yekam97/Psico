/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#5d8aa8",
                    light: "#7ba7bc",
                    dark: "#4a6d85",
                },
                sage: {
                    DEFAULT: "#8da399",
                    light: "#a8bab2",
                    dark: "#728c80",
                },
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            borderRadius: {
                '2xl': '1.5rem',
            },
        },
    },
    plugins: [],
};
