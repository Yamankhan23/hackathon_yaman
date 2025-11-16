const Mention = require("../models/Mention");

async function detectNegativeTrend() {
    const last100 = await Mention.find().sort({ createdAt: -1 }).limit(100);

    if (last100.length < 20) return false;

    const negatives = last100.filter(m => m.sentiment === "negative").length;

    if (negatives / last100.length >= 0.4) {
        console.log("⚠️ Negative sentiment trend detected!");
        return true;
    }

    return false;
}

module.exports = detectNegativeTrend;
