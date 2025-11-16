const Parser = require("rss-parser");
const Mention = require("../models/Mention");
const analyzeMention = require("./analyzeMention");

const parser = new Parser();

async function fetchRSSMentiones(keyword, saveToDB = true) {
    try {
        const feed = await parser.parseURL(
            `https://news.google.com/rss/search?q=${keyword}&hl=en-IN&gl=IN&ceid=IN:en`
        );

        const mentions = [];

        for (let item of feed.items) {
            const { sentiment, topic } = analyzeMention(
                `${item.title} ${item.contentSnippet}`
            );

            const mentionObj = {
                title: item.title,
                description: item.contentSnippet,
                source: "Google RSS",
                url: item.link,
                publishedAt: item.pubDate,
                sentiment,
                topic,
            };

            if (saveToDB) {
                const exists = await Mention.findOne({ url: item.link });
                if (!exists) await Mention.create(mentionObj);
            }

            mentions.push(mentionObj);
        }

        return mentions;
    } catch (err) {
        console.log("RSS Error:", err.message);
        return [];
    }
}

module.exports = { fetchRSSMentiones };
