/* // services/fetchMentions.js
const axios = require("axios");
const parser = require("rss-parser");
const Mention = require("../models/Mention");

const RSS_FEEDS = [
    "https://news.google.com/rss/search?q=brand+mentions",
    // Add more feeds if needed
];

async function fetchnewsMentions() {
    console.log("⏳ Fetching mentions...");

    const parserInstance = new parser();

    for (const feedUrl of RSS_FEEDS) {
        try {
            const feed = await parserInstance.parseURL(feedUrl);

            for (const item of feed.items) {
                const mention = {
                    title: item.title,
                    description: item.contentSnippet || item.content || "",
                    source: feed.title || "RSS",
                    url: item.link,
                    publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                    sentiment: "neutral", // you can later run sentiment analysis here
                    topic: item.title, // simple topic placeholder
                };

                // Upsert to avoid duplicates
                await Mention.updateOne(
                    { url: mention.url },
                    { $set: mention },
                    { upsert: true }
                );
            }

        } catch (err) {
            if (err.response && err.response.status === 429) {
                console.warn(`⚠️ Rate limit hit for feed: ${feedUrl}`);
            } else {
                console.error("Error fetching RSS feed:", err.message);
            }
        }
    }

    console.log("✔ Fetch cycle complete");
}

module.exports = fetchnewsMentions;
 */


const parser = require("rss-parser");
const Mention = require("../models/Mention");

const RSS_FEEDS = [
    "https://news.google.com/rss/search?q=brand+mentions",
];

async function fetchnewsMentions() {
    console.log("⏳ Fetching mentions...");

    const parserInstance = new parser();

    for (const feedUrl of RSS_FEEDS) {
        try {
            const feed = await parserInstance.parseURL(feedUrl);

            for (const item of feed.items) {
                // Skip items without a link
                if (!item.link) continue;

                const mention = {
                    title: item.title || "No Title",
                    description: item.contentSnippet || item.content || "",
                    source: feed.title || "RSS",
                    url: item.link,
                    publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                    sentiment: "neutral", // placeholder
                    topic: item.title || "General",
                };

                try {
                    // Upsert to avoid duplicates
                    await Mention.updateOne(
                        { url: mention.url },
                        { $set: mention },
                        { upsert: true }
                    );
                } catch (mongoErr) {
                    console.error("MongoDB error for item:", mention.url, mongoErr.message);
                    continue; // skip this item and continue
                }
            }
        } catch (err) {
            if (err.response && err.response.status === 429) {
                console.warn(`⚠️ Rate limit hit for feed: ${feedUrl}`);
            } else {
                console.error("Error fetching RSS feed:", err.message);
            }
        }
    }

    console.log("✔ Fetch cycle complete");
}

module.exports = { fetchnewsMentions };
