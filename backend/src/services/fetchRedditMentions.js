const axios = require("axios");

async function fetchRedditMentions(keyword, maxResults = 300) {
    let allMentions = [];
    let after = null;

    try {
        while (allMentions.length < maxResults) {
            const url =
                `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&limit=100` +
                (after ? `&after=${after}` : "");

            const res = await axios.get(url, {
                headers: {
                    "User-Agent": "BrandMonitorBot/1.0",
                },
            });

            const children = res.data?.data?.children || [];
            if (children.length === 0) break;

            const posts = children.map(item => ({
                title: item.data.title,
                description: item.data.selftext || "",
                source: "reddit",   // IMPORTANT FIX
                url: `https://reddit.com${item.data.permalink}`,
                publishedAt: new Date(item.data.created_utc * 1000), // actual Reddit post time
                createdAt: new Date(), // DB insertion time (optional)

                sentiment: "neutral",
                topic: keyword,
                commentsCount: item.data.num_comments,
            }));

            allMentions.push(...posts);

            after = res.data.data.after;
            if (!after) break;
        }

        return allMentions.slice(0, maxResults);
    } catch (err) {
        console.error("🔥 Reddit fetch error:", err.message);
        return [];
    }
}

module.exports = { fetchRedditMentions };
