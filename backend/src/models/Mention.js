const mongoose = require("mongoose");

const MentionSchema = new mongoose.Schema({
    title: String,
    description: String,
    source: String,         // "reddit", "news", "rss"
    url: { type: String, unique: true },
    publishedAt: Date,
    sentiment: String,
    topic: String
}, { timestamps: true });   // auto adds createdAt, updatedAt

module.exports = mongoose.model("Mention", MentionSchema);
