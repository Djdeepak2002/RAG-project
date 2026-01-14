require('dotenv').config();
const axios = require('axios');
const { QdrantClient } = require('@qdrant/js-client-rest');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Configuration
const JINA_API_KEY = process.env.JINA_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const COLLECTION_NAME = 'news_articles';

const qdrant = new QdrantClient({ host: 'localhost', port: 6333 });
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// 1. Get Query Embedding (Reuse Jina logic)
async function getQueryEmbedding(text) {
    const url = 'https://api.jina.ai/v1/embeddings';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JINA_API_KEY}`
    };
    const response = await axios.post(url, {
        model: 'jina-embeddings-v2-base-en',
        input: [text]
    }, { headers });
    return response.data.data[0].embedding;
}

// 2. Search and Answer
async function askBot(userQuery) {
    console.log(`❓ Question: "${userQuery}"`);

    // A. Embed the query
    const queryVector = await getQueryEmbedding(userQuery);

    // B. Search Qdrant for top 3 relevant articles 
    const searchResults = await qdrant.search(COLLECTION_NAME, {
        vector: queryVector,
        limit: 3,
        score_threshold: 0.75
    });

    if (!searchResults.length) {
    searchResults = await qdrant.search(COLLECTION_NAME, {
        vector: queryVector,
        limit: 5
    });
}

    // C. Construct Context
    const context = searchResults.map(res =>
        `Title: ${res.payload.title}\nContent: ${res.payload.content}`
    ).join("\n\n");

    console.log("🔍 Found context from:", searchResults.map(r => r.payload.title));

    // D. Call Gemini [cite: 33]
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a helpful news assistant. Use the following context to answer the user's question. 
    If the answer is not in the context, say "I don't have enough information from the news feed."

    CONTEXT:
    ${context}

    USER QUESTION:
    ${userQuery}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("\n🤖 Bot Answer:\n", text);
}

// Run with a sample question
// You can change this string to test different questions
askBot("What is the latest news about AI?");