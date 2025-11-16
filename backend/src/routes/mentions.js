// routes/mentions.js
const express = require("express");
const router = express.Router();
const Mention = require("../models/Mention");
const detectSpike = require("../services/spikeDetector");

// -------------------------------
// FIXED: Import Reddit fetch ONCE
// -------------------------------
let fetchRedditMentions = null;
try {
    fetchRedditMentions = require("../services/fetchRedditMentions").fetchRedditMentions;
} catch (e) {
    console.warn("Reddit service not available.");
}

// Services
const { fetchnewsMentions } = require("../services/fetchMentions");
const { fetchRSSMentiones } = require("../services/fetchRSS");

/**
 * Helper: upsert an array of mention-like objects into MongoDB using bulkWrite.
 */
async function upsertMentionsToDb(mentions = []) {
    if (!Array.isArray(mentions) || mentions.length === 0) return { inserted: 0 };

    const ops = [];

    for (const m of mentions) {
        if (!m || !m.url) continue;

        const publishedAt = m.publishedAt
            ? new Date(m.publishedAt)
            : m.createdAt
                ? new Date(m.createdAt)
                : new Date();

        const doc = {
            title: m.title || "",
            description: m.description || "",
            source: m.source || "unknown",
            url: m.url,
            publishedAt,
            sentiment: m.sentiment || "neutral",
            topic: m.topic || ""
        };

        ops.push({
            updateOne: {
                filter: { url: doc.url },
                update: { $set: doc },
                upsert: true
            }
        });
    }

    if (ops.length === 0) return { inserted: 0 };

    try {
        return await Mention.bulkWrite(ops, { ordered: false });
    } catch (err) {
        console.warn("bulkWrite warning:", err.message || err);
        return { inserted: 0 };
    }
}

// 1️⃣ Get all mentions
router.get("/", async (req, res) => {
    try {
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 10;

        const mentions = await Mention.find()
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Mention.countDocuments();
        res.json({ mentions, total });
    } catch (err) {
        console.error("Error fetching mentions:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// 2️⃣ Filter mentions
router.get("/filter", async (req, res) => {
    try {
        const { sentiment, topic, source } = req.query;
        const filter = {};

        if (sentiment) filter.sentiment = sentiment;
        if (topic) filter.topic = topic;
        if (source) filter.source = source;

        const mentions = await Mention.find(filter).sort({ createdAt: -1 });
        const total = mentions.length;

        res.json({ mentions, total });
    } catch (err) {
        console.error("Error filtering mentions:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// 3️⃣ Stats
router.get("/stats", async (req, res) => {
    try {
        const sentimentCounts = await Mention.aggregate([
            { $group: { _id: "$sentiment", count: { $sum: 1 } } },
        ]);

        const topicCounts = await Mention.aggregate([
            { $group: { _id: "$topic", count: { $sum: 1 } } },
        ]);

        res.json({ sentimentCounts, topicCounts });
    } catch (err) {
        console.error("Error fetching stats:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// 4️⃣ Spike check (Reddit ONLY)
router.get("/spike", async (req, res) => {
    try {
        const keyword = req.query.q || "samsung";
        const result = await detectSpike(keyword); // detectSpike already uses MongoDB
        res.json(result);
    } catch (err) {
        console.error("Error checking spike:", err.message);
        res.status(500).json({ message: "Spike detection error" });
    }
});

// 5️⃣ Negative trend
router.get("/negative-trend", async (req, res) => {
    try {
        const last50 = await Mention.find().sort({ createdAt: -1 }).limit(50);
        const negatives = last50.filter((m) => m.sentiment === "negative").length;

        res.json({ trend: negatives >= 20 });
    } catch (err) {
        console.error("Error checking negative trend:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// 6️⃣ Search (news + RSS + Reddit → save Reddit → return merged)
router.get("/search", async (req, res) => {
    const keyword = req.query.q;
    if (!keyword) return res.status(400).json({ message: "Query parameter 'q' is required" });

    try {
        const sources = [];

        // news
        sources.push(
            (async () => {
                try {
                    return await fetchnewsMentions(keyword, false);
                } catch (e) {
                    console.error("Error fetching news:", e.message);
                    return [];
                }
            })()
        );

        // RSS
        sources.push(
            (async () => {
                try {
                    return await fetchRSSMentiones(keyword, false);
                } catch (e) {
                    console.error("Error fetching RSS:", e.message);
                    return [];
                }
            })()
        );

        // Reddit (only conversational)
        if (fetchRedditMentions) {
            sources.push(
                (async () => {
                    try {
                        return await fetchRedditMentions(keyword, 80); // safe limit
                    } catch (e) {
                        console.error("Error fetching Reddit:", e.message);
                        return [];
                    }
                })()
            );
        }

        const results = await Promise.all(sources);
        const flat = results.flat().filter(Boolean);

        // Store ONLY Reddit mentions for spike detection
        // Inside /routes/mentions.js search endpoint
        const redditOnly = flat.filter(m => m.source.toLowerCase() === "reddit");
        await upsertMentionsToDb(redditOnly);


        // Sort
        flat.sort((a, b) => {
            const da = new Date(a.publishedAt || a.createdAt);
            const db = new Date(b.publishedAt || b.createdAt);
            return db - da;
        });

        res.json({ mentions: flat, total: flat.length });
    } catch (err) {
        console.error("Search error:", err.message);
        res.status(500).json({ message: "Error fetching search results" });
    }
});

module.exports = router;
