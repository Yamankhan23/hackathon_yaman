"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import MentionsTable from "./components/MentionsTable";
import SentimentChart from "./components/SentimentChart";
import TopicsChart from "./components/TopicsChart";
import SpikeAlerts from "./components/SpikeAlerts";
import SearchBar from "./components/SearchBar";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";

interface Spike {
    topic: string;
    sentiment: "positive" | "neutral" | "negative";
    count: number;
    latestTime: string;
    url?: string; // safe optional
}

export default function Dashboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [spikesData, setSpikesData] = useState<Spike[]>([]);

    const { theme } = useTheme();

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        setLoading(true);
        setError("");
        try {
            const res = await axios.get(
                `https://hackathon-yaman.onrender.com/api/mentions/search?q=${encodeURIComponent(query)}`
            );
            setSearchResults(res.data.mentions);
        } catch (err: any) {
            console.error(err);
            setError("Failed to fetch search results");
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const cancelSearch = () => {
        setLoading(false);
    };

    // Fetch spikes for top row
    // Fetch spikes for top row
    useEffect(() => {
        const fetchSpikes = async () => {
            try {
                const res = await axios.get(
                    "https://hackathon-yaman.onrender.com/api/mentions/spike?q=" + (searchQuery || "delhi")
                );

                const data = res.data;

                // Convert backend's 'conversations' → UI's 'spikes'
                const parsed = Array.isArray(data.conversations)
                    ? data.conversations.map((item: any) => ({
                        topic: data.keyword || item.topic || "unknown",
                        count: 1, // each conversation = 1 mention
                        sentiment: "neutral",
                        latestTime: item.publishedAt || item.createdAt, // ✅ use actual Reddit post time
                        url: item.url
                    }))
                    : [];

                setSpikesData(parsed);
            } catch (err) {
                console.error("Failed to fetch spikes:", err);
            }
        };

        fetchSpikes();
    }, [searchQuery]);


    return (
        <div
            className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${theme === "dark" ? "bg-[#121212] text-white" : "bg-gray-50 text-gray-900"
                }`}
        >
            <ThemeToggle />

            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            <SearchBar onSearch={handleSearch} />

            <AnimatePresence>
                {loading && (
                    <motion.div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div
                            className={`rounded-lg p-6 flex flex-col items-center gap-4 shadow-lg transition-colors duration-300 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                                }`}
                        >
                            <div className="loader border-t-4 border-b-4 border-blue-600 w-12 h-12 rounded-full animate-spin"></div>
                            <p>Fetching results for "{searchQuery}"...</p>
                            <button
                                onClick={cancelSearch}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && <p className="text-red-500 mt-2 font-medium">{error}</p>}

            <div className="grid gap-6 md:grid-cols-3 mt-4">
                <SentimentChart searchQuery={searchQuery} />
                <TopicsChart searchQuery={searchQuery} />
                <SpikeAlerts spikes={spikesData} searchQuery={searchQuery} />
            </div>

            <div className="mt-6">
                <MentionsTable mentions={searchResults} searchQuery={searchQuery} />
            </div>
        </div>
    );
}
