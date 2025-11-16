const Sentiment = require("sentiment");
const nlp = require("compromise");

const sentiment = new Sentiment();

function analyzeMention(text) {
    const s = sentiment.analyze(text);

    let sentimentLabel = "neutral";
    if (s.score > 1) sentimentLabel = "positive";
    if (s.score < -1) sentimentLabel = "negative";

    // Extract nouns for topic
    const doc = nlp(text);
    const nouns = doc.nouns().out("array");

    const topic = nouns.length > 0 ? nouns[0] : "general";

    return { sentiment: sentimentLabel, topic };
}

module.exports = analyzeMention;
