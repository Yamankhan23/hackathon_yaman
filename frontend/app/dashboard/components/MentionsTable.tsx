"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../../../context/ThemeContext";

interface Mention {
    title: string;
    description: string;
    source: string;
    publishedAt: string;
    sentiment: "positive" | "neutral" | "negative";
    topic: string;
    url?: string; // Added url field
}

interface MentionsTableProps {
    mentions?: Mention[];          // optional array of mentions from parent
    searchQuery?: string;          // optional search query
}

export default function MentionsTable({ mentions = [], searchQuery = "" }: MentionsTableProps) {
    const { theme } = useTheme();
    const [fetchedMentions, setFetchedMentions] = useState<Mention[]>([]);
    const [skip, setSkip] = useState(0);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const fetchMentions = async (skipVal = 0) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/mentions?skip=${skipVal}&limit=${limit}`);
            const data = res.data.mentions as Mention[];
            setFetchedMentions(prev => skipVal === 0 ? data : [...prev, ...data]);
            setTotal(res.data.total);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMentions(0);
    }, []);

    const displayMentions = mentions.length > 0 ? mentions : fetchedMentions;

    return (
        <div className={`overflow-x-auto rounded-xl shadow p-4 ${theme === "dark" ? "bg-[#1e1e1e] text-[#e0e0e0]" : "bg-white text-gray-900"
            }`}>
            <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-[#e0e0e0]" : ""}`}>
                Recent Mentions {searchQuery ? `for "${searchQuery}"` : ""}
            </h3>
            <table className="min-w-full text-left border-collapse">
                <thead>
                    <tr className={`border-b ${theme === "dark" ? "border-[#333]" : ""}`}>
                        <th className="px-2 py-1">Title</th>
                        <th className="px-2 py-1">Sentiment</th>
                        <th className="px-2 py-1">Topic</th>
                        <th className="px-2 py-1">Source</th>
                        <th className="px-2 py-1">Published</th>
                        <th className="px-2 py-1">Link</th>
                    </tr>
                </thead>
                <tbody>
                    {displayMentions.map((m, idx) => (
                        <tr key={idx} className={`border-b ${theme === "dark" ? "border-[#333] hover:bg-[#2a2a2a]" : "hover:bg-gray-50"}`}>
                            <td className="px-2 py-1">{m.title}</td>
                            <td className={`px-2 py-1 font-semibold ${m.sentiment === "positive" ? "text-green-500" :
                                    m.sentiment === "negative" ? "text-red-500" : theme === "dark" ? "text-[#a0a0a0]" : "text-gray-600"
                                }`}>{m.sentiment}</td>
                            <td className="px-2 py-1">{m.topic}</td>
                            <td className="px-2 py-1">{m.source}</td>
                            <td className="px-2 py-1">{new Date(m.publishedAt).toLocaleString()}</td>
                            <td className="px-2 py-1">
                                {m.url ? (
                                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                                        View
                                    </a>
                                ) : "N/A"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {displayMentions.length < total && (
                <button
                    className={`mt-4 px-4 py-2 rounded font-medium transition ${theme === "dark" ? "bg-[#2a2a2a] hover:bg-[#333]" : "bg-gray-200 hover:bg-gray-300"
                        }`}
                    onClick={() => {
                        const nextSkip = skip + limit;
                        setSkip(nextSkip);
                        fetchMentions(nextSkip);
                    }}
                >
                    Load More
                </button>
            )}
        </div>

    );
}
