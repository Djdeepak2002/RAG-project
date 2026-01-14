require('dotenv').config();
const Parser = require('rss-parser');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const { QdrantClient } = require('@qdrant/js-client-rest');

// Configuration
const JINA_API_KEY = process.env.JINA_API_KEY;
const COLLECTION_NAME = 'news_articles';
const parser = new Parser();
const client = new QdrantClient({ host: 'localhost', port: 6333 });



// RSS feeds to fetch news articles
const RSS_FEEDS = [
    {
        url: "https://techcrunch.com/feed/",
        source: "techcrunch",
        category: "technology"
    },
    {
        url: "https://feeds.bbci.co.uk/news/rss.xml",
        source: "bbc",
        category: "general"
    },
    {
        url: "https://feeds.bbci.co.uk/news/world/rss.xml",
        source: "bbc",
        category: "world"
    },
    {
        url: "https://www.theguardian.com/uk/rss",
        source: "guardian",
        category: "general"
    },
    {
        url: "https://www.theguardian.com/business/rss",
        source: "guardian",
        category: "business"
    },
    {
        url: "https://www.theguardian.com/technology/rss",
        source: "guardian",
        category: "technology"
    },
    {
        url: "https://www.aljazeera.com/xml/rss/all.xml",
        source: "aljazeera",
        category: "world"
    }
];





// Hehlper function for chunking text
function chunkText(text, chunkSize = 400, overlap = 80) {
    const words = text.split(" ");
    const chunks = [];

    for (let i = 0; i < words.length; i += chunkSize - overlap) {
        chunks.push(words.slice(i, i + chunkSize).join(" "));
    }

    return chunks;
}


// 1. Fetch News (RSS)
async function fetchNews() {
    console.log("📡 Fetching mixed news from RSS feeds...");

    const allArticles = [];

    for (const feedConfig of RSS_FEEDS) {
        try {
            const feed = await parser.parseURL(feedConfig.url);

            const items = feed.items.slice(0, 10).map(item => ({
                title: item.title,
                link: item.link,
                content: item.contentSnippet || item.content || "",
                source: feedConfig.source,
                category: feedConfig.category
            }));

            allArticles.push(...items);
        } catch (err) {
            console.error(`❌ Failed to fetch ${feedConfig.url}`, err.message);
        }
    }

    console.log(`📰 Total articles fetched: ${allArticles.length}`);
    return allArticles;
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
        /* const textsToEmbed = articles.map(a => `${a.title}: ${a.content}`);

        


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
        })); */

        let points = [];
        let pointId = 1;

        for (const article of articles) {
            const chunks = chunkText(`${article.title}. ${article.content}`);

            if (!chunks.length) continue;

            const embeddings = await getEmbeddings(chunks);

            chunks.forEach((chunk, i) => {
                points.push({
                    id: uuidv4(),
                    vector: embeddings[i],
                    payload: {
                        title: article.title,
                        link: article.link,
                        content: chunk,
                        source: article.source,
                        category: article.category,
                        ingestedAt: new Date().toISOString()
                    }
                });

            });
        }




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