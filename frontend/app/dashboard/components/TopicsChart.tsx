"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Cell,
} from "recharts";
import { useTheme } from "../../../context/ThemeContext";

interface Mention {
    topic: string;
}

interface ComponentProps {
    searchQuery: string;
}

export default function TopicsChart({ searchQuery }: ComponentProps) {
    const [data, setData] = useState<{ name: string; value: number }[]>([]);
    const { theme } = useTheme();

    useEffect(() => {
        const effectiveQuery = searchQuery || "samsung";
        async function fetchData() {
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/mentions/search?q=${encodeURIComponent(
                        effectiveQuery
                    )}`
                );

                const mentions: Mention[] = res.data.mentions || [];
                const topicCounts: Record<string, number> = {};

                mentions.forEach((m) => {
                    topicCounts[m.topic] = (topicCounts[m.topic] || 0) + 1;
                });

                const chartData = Object.entries(topicCounts)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5);

                setData(chartData);
            } catch (err) {
                console.error("Error fetching topic stats:", err);
            }
        }
        fetchData();
    }, [searchQuery]);

    return (
        <div
            className={`rounded-xl shadow p-4 pb-4 transition-colors duration-300 ${theme === "dark" ? "bg-[#1E1E1E] text-white" : "bg-white text-gray-900"
                }`}
        >
            <h3 className="text-lg font-semibold mb-2">Top Topics</h3>

            <ResponsiveContainer width="100%" height={Math.max(250, data.length * 55)}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                    barCategoryGap={14}
                >
                    <CartesianGrid
                        horizontal
                        vertical={false}
                        strokeDasharray="3 5"
                        stroke={
                            theme === "dark"
                                ? "rgba(255,255,255,0.08)"
                                : "rgba(0,0,0,0.05)"
                        }
                    />

                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={160}
                        tick={{ fontSize: 13, opacity: 0.85 }}
                    />

                    {/* PREMIUM GLASS TOOLTIP */}
                    <Tooltip
                        content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;

                            const item = payload[0];

                            return (
                                <div
                                    className={`backdrop-blur-md px-3 py-2 rounded-xl shadow-lg text-sm border ${theme === "dark"
                                            ? "bg-white/10 text-white border-white/10"
                                            : "bg-white/80 text-gray-900 border-gray-200"
                                        }`}
                                >
                                    <p className="font-semibold">{item.payload.name}</p>
                                    <p className="opacity-80">Mentions: {item.value}</p>
                                </div>
                            );
                        }}
                        cursor={{
                            fill:
                                theme === "dark"
                                    ? "rgba(255,255,255,0.05)"
                                    : "rgba(0,0,0,0.04)",
                        }}
                    />

                    {/* GRADIENT BAR + HOVER EFFECT */}
                    <defs>
                        <linearGradient id="premiumBar" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#60a5fa" />
                            <stop offset="50%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#2563eb" />
                        </linearGradient>
                    </defs>

                    <Bar
                        dataKey="value"
                        barSize={26}
                        radius={[7, 7, 7, 7]}
                        fill="url(#premiumBar)"
                        animationDuration={900}
                        animationEasing="ease-out"
                        activeBar={{ style: { filter: "drop-shadow(0px 0px 6px #3b82f6)" } }}
                    >
                        {data.map((entry, index) => (
                            <Cell key={index} cursor="pointer" />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
