"use client";

import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";

interface SearchProps {
    onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchProps) {
    const [query, setQuery] = useState("");
    const { theme } = useTheme();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) onSearch(query.trim());
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-6">
            <input
                type="text"
                placeholder="Search mentions..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`flex-1 px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${theme === "dark" ? "bg-[#1E1E1E] text-white border-gray-700 placeholder-gray-400" : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                    }`}
            />
            <button
                type="submit"
                className={`px-4 py-2 rounded font-medium transition-colors duration-300 ${theme === "dark" ? "bg-blue-700 hover:bg-blue-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
            >
                Search
            </button>
        </form>
    );
}
