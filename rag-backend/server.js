require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { QdrantClient } = require('@qdrant/js-client-rest');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(cors());

// --- Configuration ---
const PORT = 3000;
const JINA_API_KEY = process.env.JINA_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const COLLECTION_NAME = 'news_articles';

// --- Clients ---
const qdrant = new QdrantClient({ host: 'localhost', port: 6333 });
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// Redis Setup: connect to default local instance
const redis = new Redis(); 

// --- Helper Functions (From your scripts) ---

async function getQueryEmbedding(text) {
    try {
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
    } catch (e) {
        console.error("Embedding Error:", e.message);
        throw new Error("Failed to generate embedding");
    }
}

// --- API Endpoints ---

// 1. CHAT ENDPOINT
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        if (!message || !sessionId) {
            return res.status(400).json({ error: "Message and sessionId are required" });
        }

        console.log(`📩 [${sessionId}] User: ${message}`);

        // A. RAG Retrieval
        const queryVector = await getQueryEmbedding(message);
        const searchResults = await qdrant.search(COLLECTION_NAME, {
            vector: queryVector,
            limit: 3
        });

        const context = searchResults.map(r => 
            `Title: ${r.payload.title}\nContent: ${r.payload.content}`
        ).join("\n\n");

        // B. Fetch Chat History from Redis
        // We get the last 10 messages to keep context
        const historyKey = `session:${sessionId}`;
        const rawHistory = await redis.lrange(historyKey, 0, 9);
        const history = rawHistory.map(item => JSON.parse(item)).reverse(); // Reverse to get chronological order

        // C. Build Gemini Prompt
        // We include history in the prompt so the bot "remembers"
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const chat = model.startChat({
            history: history.map(h => ({
                role: h.sender === 'user' ? 'user' : 'model',
                parts: [{ text: h.text }]
            })),
        });

        const prompt = `
        You are a helpful news assistant. Answer based ONLY on the context provided below.
        
        CONTEXT:
        ${context}
        
        USER QUESTION: ${message}
        `;

        const result = await chat.sendMessage(prompt);
        const botReply = result.response.text();

        // D. Save to Redis (Push to head of list)
        // Store User Msg
        await redis.lpush(historyKey, JSON.stringify({ sender: 'user', text: message }));
        // Store Bot Msg
        await redis.lpush(historyKey, JSON.stringify({ sender: 'bot', text: botReply }));
        
        // Set TTL (Time to Live) for 24 hours (86400 seconds)
        await redis.expire(historyKey, 86400);

        res.json({ reply: botReply });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Something went wrong processing your request." });
    }
});

// 2. GET HISTORY ENDPOINT
app.get('/api/session/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const historyKey = `session:${sessionId}`;
    
    // Get all messages
    const rawHistory = await redis.lrange(historyKey, 0, -1);
    const history = rawHistory.map(item => JSON.parse(item)).reverse();
    
    res.json(history);
});

// 3. CLEAR HISTORY ENDPOINT
app.delete('/api/session/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    await redis.del(`session:${sessionId}`);
    res.json({ message: "Session cleared" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});