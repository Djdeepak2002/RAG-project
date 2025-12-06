# 📰 News RAG Chatbot - Backend API

This is the backend service for the News RAG Chatbot. It provides a RESTful API to ingest news articles, generate vector embeddings, manage chat sessions, and generate AI responses using Google Gemini.

## 🛠️ Tech Stack

* **Runtime:** Node.js (Express.js)
* **LLM:** Google Gemini (via `google-generative-ai`)
* **Embeddings:** Jina Embeddings v2
* **Vector Database:** Qdrant (Dockerized)
* **Session Caching:** Redis (Dockerized)
* **Data Source:** RSS Feeds (via `rss-parser`)

## 🚀 Features

* **RAG Pipeline:** Ingests news articles, chunks text, and stores vectors in Qdrant.
* **Context-Aware Chat:** Retrieves top-k relevant articles to ground the LLM's response.
* **Session Management:** Uses Redis to store chat history per session ID.
* **Automatic Expiry:** Redis keys are set with a TTL (Time-To-Live) of 24 hours to manage memory efficiency.

## ⚙️ Setup & Installation

### 1. Prerequisites
Ensure you have **Docker** and **Node.js** installed.

### 2. Start Services
Run the Vector Database and Redis using Docker:
```bash
# Start Qdrant
docker run -d -p 6333:6333 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant

# Start Redis
docker run -d -p 6379:6379 redis

Here are the two separate professional README.md files. These are written to satisfy the "Code Quality" and "Code Walkthrough" sections of your assignment .


1. Backend README
Save this file inside your rag-backend folder as README.md.

Markdown

# 📰 News RAG Chatbot - Backend API

This is the backend service for the News RAG Chatbot. It provides a RESTful API to ingest news articles, generate vector embeddings, manage chat sessions, and generate AI responses using Google Gemini.

## 🛠️ Tech Stack

* **Runtime:** Node.js (Express.js)
* **LLM:** Google Gemini (via `google-generative-ai`)
* **Embeddings:** Jina Embeddings v2
* **Vector Database:** Qdrant (Dockerized)
* **Session Caching:** Redis (Dockerized)
* **Data Source:** RSS Feeds (via `rss-parser`)

## 🚀 Features

* **RAG Pipeline:** Ingests news articles, chunks text, and stores vectors in Qdrant.
* **Context-Aware Chat:** Retrieves top-k relevant articles to ground the LLM's response.
* **Session Management:** Uses Redis to store chat history per session ID.
* **Automatic Expiry:** Redis keys are set with a TTL (Time-To-Live) of 24 hours to manage memory efficiency.

## ⚙️ Setup & Installation

### 1. Prerequisites
Ensure you have **Docker** and **Node.js** installed.

### 2. Start Services
Run the Vector Database and Redis using Docker:
```bash
# Start Qdrant
docker run -d -p 6333:6333 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant

# Start Redis
docker run -d -p 6379:6379 redis
3. Install Dependencies
Bash

npm install
4. Environment Variables
Create a .env file in the root directory:

Code snippet

JINA_API_KEY=your_jina_key
GEMINI_API_KEY=your_gemini_key
5. Ingest Data
Run the ingestion script to fetch news and populate the Vector DB:

Bash

node ingest.js
Expected Output: "✅ Ingestion complete! Articles indexed."

6. Run Server
Bash

node server.js
The API will be available at http://localhost:3000.

🧠 Design Decisions
Why Qdrant?
I chose Qdrant because it is a lightweight, open-source vector database that is easy to run locally via Docker. It supports high-performance vector similarity search (Cosine distance), which is essential for accurate RAG retrieval.

Caching Strategy (Redis)
To ensure low latency and user context continuity, I used Redis for session storage.

Structure: Chat history is stored as a List (lpush/lrange) keyed by session:{uuid}.

TTL Configuration: A TTL of 86400 seconds (24 hours) is applied to every session key. This serves as a passive "cache warming" strategy where active sessions stay hot, while inactive ones are automatically purged to save memory.

📡 API Endpoints
POST /api/chat: Accepts { sessionId, message }. Returns AI response.

GET /api/session/:id: Returns chat history.

DELETE /api/session/:id: Clears session history.