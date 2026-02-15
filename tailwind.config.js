/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#e86c25",
                    hover: "#d05d1a",
                    light: "#fdf2ec",
                },
                cardbg: "#ffffff",
                bg: "#f3f4f6",
                textprimary: "#1f2937",
                textsecondary: "#6b7280",
                textmuted: "#9ca3af",
                border: "#e5e7eb",
                inputbg: "#f9fafb",
                sidebar: {
                    DEFAULT: "#1e293b",
                    hover: "#334155",
                    active: "#e86c25",
                },
                navy: "#0f172a",
                success: "#16a34a",
                warning: "#f59e0b",
                danger: "#ef4444",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
        },
    },
    plugins: [],
};
