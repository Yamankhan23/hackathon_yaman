"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={`relative min-h-screen flex flex-col items-center justify-center px-6 text-center transition-colors duration-300 ${theme === "dark" ? "bg-[#121212] text-white" : "bg-gray-50 text-gray-900"
        }`}
    >
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white shadow hover:scale-105 transition-transform"
      >
        {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
      </button>

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-4"
      >
        Brand Tracker
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} max-w-lg`}
      >
        Monitor brand mentions, sentiment, and trends across the internet — all in real time.
      </motion.p>

      <div className="mt-8 flex gap-4">
        <Link
          href="/dashboard"
          className={`px-6 py-2 rounded-lg transition-all font-medium shadow-lg ${theme === "dark"
              ? "bg-blue-600 text-white hover:bg-blue-500"
              : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
