require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const { fetchnewsMentions } = require('./services/fetchMentions');
const { fetchRSSMentiones } = require('./services/fetchRSS');
const { fetchRedditMentions } = require("./services/fetchRedditMentions");
const { fetchYouTubeMentions } = require("./services/fetchYouTubeMentions");
const detectSpike = require("./services/spikeDetector");
const detectNegativeTrend = require("./services/sentimentMonitor");
const mentionRoutes = require("./routes/mentions");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/mentions", mentionRoutes);

// ENV variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Check if MONGO_URI exists
if (!MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI is missing from .env file");
    process.exit(1);
}

// Connect to MongoDB
mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Cron Job (runs every 5 minutes)
cron.schedule("*/5 * * * *", async () => {
    console.log("⏳Fetching mentions and checking alerts...");

    await fetchnewsMentions("samsung");
    await fetchRSSMentiones("samsung");
    await fetchRedditMentions("samsung", 500);
    await fetchYouTubeMentions("samsung");

    // Spike & sentiment alerts
    await detectSpike("samsung");
    await detectNegativeTrend();
    console.log("✔ Cron cycle complete\n");
});