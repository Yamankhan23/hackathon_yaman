const Mention = require("../models/Mention");

/**
 * Detects spikes for a keyword based on recent Reddit mentions.
 * Only considers publishedAt from Reddit posts for timing.
 */
async function detectSpike(keyword) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // 1️⃣ Recent mentions (last 1 hour)
    const recentMentions = await Mention.find({
        source: "reddit",
        publishedAt: { $gte: oneHourAgo },
        $or: [
            { title: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } }
        ]
    })
        .select("title url source publishedAt topic")
        .sort({ publishedAt: -1 })
        .limit(50);

    // 2️⃣ Previous hour mentions
    const oldMentions = await Mention.find({
        source: "reddit",
        publishedAt: { $gte: twoHoursAgo, $lt: oneHourAgo },
        $or: [
            { title: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } }
        ]
    })
        .limit(50);

    const recentCount = recentMentions.length;
    const oldCount = oldMentions.length || 1; // avoid divide by zero

    const spikeRate = recentCount / oldCount;
    const spikeDetected = spikeRate >= 1.5; // 50% increase

    // Map for frontend
    const conversations = recentMentions.map(m => ({
        title: m.title,
        url: m.url,
        source: m.source,
        publishedAt: m.publishedAt,
        topic: m.topic
    }));

    return {
        keyword,
        spikeDetected,
        spikeRate: spikeRate.toFixed(2),
        recentCount,
        oldCount,
        conversations
    };
}

module.exports = detectSpike;
