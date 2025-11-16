"use client";

import { motion } from "framer-motion";
import { useTheme } from "../../../context/ThemeContext";

interface Spike {
    topic: string;
    count: number;
    sentiment: "positive" | "neutral" | "negative";
    latestTime: string;
    url?: string; // safe optional, no UI impact
}

interface SpikeAlertsProps {
    spikes: Spike[];
    searchQuery: string;
}

export default function SpikeAlerts({ spikes, searchQuery }: SpikeAlertsProps) {
    const { theme } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl shadow p-4 overflow-y-auto transition-colors duration-300 min-h-[20rem]"
            style={{
                backgroundColor: theme === "dark" ? "#1E1E1E" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#111827"
            }}
        >
            <h3 className="text-lg font-semibold mb-2">
                Spike Alerts {searchQuery ? `for "${searchQuery}"` : ""}
            </h3>

            <ul className={`divide-y transition-colors duration-300 ${theme === "dark" ? "divide-gray-700" : "divide-gray-200"}`}>
                {spikes.length > 0 ? (
                    spikes.map((s, idx) => (
                        <li key={idx} className="py-2 flex flex-col justify-between">
                            <span className="font-medium">{s.topic}</span>

                            <span
                                className={`font-semibold ${s.sentiment === "positive"
                                        ? "text-green-500"
                                        : s.sentiment === "negative"
                                            ? "text-red-500"
                                            : "text-yellow-500"
                                    }`}
                            >
                                {s.count} mentions ({s.sentiment})
                            </span>

                            <span className="text-gray-400 text-sm">
                                Last mention: {new Date(s.latestTime).toLocaleString()}
                            </span>

                            {s.url && (
                                <a
                                    href={s.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 text-sm mt-1 hover:underline"
                                >
                                    View Conversation
                                </a>
                            )}
                        </li>
                    ))
                ) : (
                    <li className="py-2 text-gray-500">No spikes detected</li>
                )}
            </ul>
        </motion.div>
    );
}
