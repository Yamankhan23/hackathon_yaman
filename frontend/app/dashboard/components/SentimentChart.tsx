"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../../context/ThemeContext";

type Sentiment = "positive" | "neutral" | "negative";

interface Mention {
    sentiment: Sentiment | string;
}

interface SentimentData {
    name: Sentiment;
    value: number;
    [key: string]: string | number;
}

interface ComponentProps {
    searchQuery: string;
}

const COLORS: Record<Sentiment, string> = {
    positive: "#22c55e",
    neutral: "#9ca3af",
    negative: "#ef4444",
};

export default function SentimentChart({ searchQuery }: ComponentProps) {
    const [data, setData] = useState<SentimentData[]>([
        { name: "positive", value: 0 },
        { name: "neutral", value: 0 },
        { name: "negative", value: 0 },
    ]);

    const { theme } = useTheme();

    useEffect(() => {
        async function fetchData() {
            const q = searchQuery || "samsung";
            try {
                const res = await axios.get<{ mentions: Mention[] }>(
                    `https://hackathon-yaman.onrender.com/api/mentions/search?q=${encodeURIComponent(q)}`
                );

                const mentions = res.data.mentions || [];

                const counts: Record<Sentiment, number> = {
                    positive: 0,
                    neutral: 0,
                    negative: 0,
                };

                mentions.forEach((m) => {
                    const s = m.sentiment as Sentiment;
                    if (counts[s] !== undefined) counts[s] += 1;
                });

                setData([
                    { name: "positive", value: counts.positive },
                    { name: "neutral", value: counts.neutral },
                    { name: "negative", value: counts.negative },
                ]);
            } catch (err) {
                console.error("Error fetching sentiment data:", err);
            }
        }

        fetchData();
    }, [searchQuery]);

    return (
        <div
            className={`rounded-xl shadow p-4 pb-8 min-h-[22rem] transition-colors duration-300 ${theme === "dark"
                ? "bg-[#1E1E1E] text-white"
                : "bg-white text-gray-900"
                }`}
        >
            <h3 className="text-lg font-semibold mb-3">Sentiment Distribution</h3>

            <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        isAnimationActive
                        label={({ name, percent }) =>
                            `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                    >
                        {data.map((entry) => (
                            <Cell
                                key={entry.name}
                                fill={COLORS[entry.name as Sentiment]}
                            />
                        ))}
                    </Pie>

                    <Tooltip
                        wrapperStyle={{
                            background: theme === "dark" ? "#2a2a2a" : "#ffffff",
                            borderRadius: "8px",
                            padding: "6px 8px",
                            border:
                                theme === "dark"
                                    ? "1px solid #444"
                                    : "1px solid #ddd",
                        }}
                        contentStyle={{
                            background: "transparent",
                            border: "none",
                        }}
                        labelStyle={{
                            color: theme === "dark" ? "#fff" : "#000",
                        }}
                        itemStyle={{
                            color: theme === "dark" ? "#fff" : "#000",
                            fontSize: "14px",
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
