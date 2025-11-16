const axios = require("axios");

async function fetchYouTubeMentions(keyword) {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY; // your free YouTube API key
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(keyword)}&maxResults=10&key=${apiKey}`;
        const res = await axios.get(url);

        const mentions = res.data.items.map(item => ({
            title: item.snippet.title,
            description: item.snippet.description,
            source: "YouTube",
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            publishedAt: item.snippet.publishedAt,
            sentiment: "neutral", // optional: run analyzeMention for sentiment
            topic: keyword
        }));

        return mentions;
    } catch (err) {
        console.error("YouTube fetch error:", err.message);
        return [];
    }
}

module.exports = { fetchYouTubeMentions };
