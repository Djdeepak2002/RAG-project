require('dotenv').config();
const Parser = require('rss-parser');
const axios = require('axios');
const { QdrantClient } = require('@qdrant/js-client-rest');

// Configuration
const JINA_API_KEY = process.env.JINA_API_KEY;
const COLLECTION_NAME = 'news_articles';
const parser = new Parser();
const client = new QdrantClient({ host: 'localhost', port: 6333 });

// 1. Fetch News (RSS)
async function fetchNews() {
    console.log("📡 Fetching news...");
    // Using a reliable TechCrunch feed for the assignment demo
    // You can swap this with the Reuters feed if preferred
    const feed = await parser.parseURL('https://techcrunch.com/feed/'); 
    
    // We only take the first 50 items as per assignment [cite: 8]
    return feed.items.slice(0, 50).map(item => ({
        title: item.title,
        link: item.link,
        content: item.contentSnippet || item.content || "" 
    }));
}

// 2. Generate Embeddings using Jina [cite: 9]
async function getEmbeddings(texts) {
    console.log(`🧠 Generating embeddings for ${texts.length} articles...`);
    const url = 'https://api.jina.ai/v1/embeddings';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JINA_API_KEY}`
    };
    
    const data = {
        model: 'jina-embeddings-v2-base-en',
        input: texts
    };

    try {
        const response = await axios.post(url, data, { headers });
        return response.data.data.map(item => item.embedding);
    } catch (error) {
        console.error("Error generating embeddings:", error.response ? error.response.data : error.message);
        throw error;
    }
}

// 3. Main Ingestion Flow
async function runIngestion() {
    try {
        // A. Setup Collection
        const collections = await client.getCollections();
        const exists = collections.collections.find(c => c.name === COLLECTION_NAME);
        
        if (!exists) {
            console.log("📦 Creating Qdrant collection...");
            await client.createCollection(COLLECTION_NAME, {
                vectors: { size: 768, distance: 'Cosine' } // Jina v2 base uses 768 dimensions
            });
        }

        // B. Get Data
        const articles = await fetchNews();
        
        // C. Get Embeddings
        // We embed the "content" of the article
        const textsToEmbed = articles.map(a => `${a.title}: ${a.content}`);
        const embeddings = await getEmbeddings(textsToEmbed);

        // D. Prepare Points for Qdrant
        const points = articles.map((article, index) => ({
            id: index + 1, // Simple ID
            vector: embeddings[index],
            payload: {
                title: article.title,
                link: article.link,
                content: article.content
            }
        }));

        // E. Upload [cite: 10]
        console.log("💾 Storing in Vector DB...");
        await client.upsert(COLLECTION_NAME, {
            wait: true,
            points: points
        });

        console.log("✅ Ingestion complete! Articles indexed.");

    } catch (err) {
        console.error("Ingestion failed:", err);
    }
}

runIngestion();