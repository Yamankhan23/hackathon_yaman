// components/ThemeToggle.tsx
"use client";
import { useTheme } from "../../context/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="fixed top-4 right-4 z-50 bg-gray-200 dark:bg-gray-800 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
            aria-label="Toggle theme"
        >
            {theme === "light" ? (
                <MoonIcon className="w-6 h-6 text-gray-900" />
            ) : (
                <SunIcon className="w-6 h-6 text-yellow-400" />
            )}
        </button>
    );
}
