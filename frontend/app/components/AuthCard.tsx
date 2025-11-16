"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface AuthCardProps {
    title: string;
    children: ReactNode;
}

export default function AuthCard({ title, children }: AuthCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md mx-auto mt-20 bg-white/70 backdrop-blur-xl border border-gray-200 
        shadow-xl rounded-2xl p-8"
        >
            <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">{title}</h1>
            {children}
        </motion.div>
    );
}
