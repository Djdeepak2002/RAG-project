# 📰 News RAG Chatbot -- Backend API

A production-ready backend service for a **Retrieval-Augmented
Generation (RAG) News Chatbot**, built using Node.js, Qdrant, Redis,
Jina Embeddings, and Google Gemini. It ingests real-time news, stores
semantic vectors, retrieves context, and generates grounded AI
responses.

## ⭐ Overview

This backend handles:

-   Fetching and chunking news articles from RSS feeds\
-   Generating embedding vectors using **Jina Embeddings v2**\
-   Storing and searching vectors in **Qdrant**\
-   Maintaining chat sessions using **Redis**\
-   Generating context-aware responses using **Google Gemini**\
-   Exposing REST APIs for chat interactions and session management

## 🛠️ Tech Stack

  Component          Technology
  ------------------ ------------------------
  Runtime            Node.js (Express.js)
  LLM                Google Gemini
  Embeddings         Jina Embeddings v2
  Vector Database    Qdrant (Docker)
  Cache / Sessions   Redis (Docker)
  Data Source        RSS Feeds (TechCrunch)

## 🚀 Features

### 🔹 RAG Pipeline

-   Fetches news from RSS\
-   Chunks content\
-   Generates embeddings\
-   Stores semantic vectors in Qdrant

### 🔹 Context-Aware Chat

-   Retrieves top-k relevant articles\
-   Sends grounded context to Gemini\
-   Produces fact-based answers

### 🔹 Session Management

-   Chat history stored per session in Redis\
-   TTL: **24 hours**\
-   Automatic cleanup of inactive sessions

## 📂 Project Structure

    rag-backend/
    │── ingest.js
    │── server.js
    │── utils/
    │     └── jina.js
    │── services/
    │     ├── qdrant.js
    │     └── redis.js
    │── routes/
    │     └── chat.js
    │── .env
    │── package.json
    └── README.md

## ⚙️ Installation & Setup

### 1️⃣ Prerequisites

-   Node.js v18+\
-   Docker installed

### 2️⃣ Start Required Services

#### Start Qdrant

``` bash
docker run -d -p 6333:6333   -v $(pwd)/qdrant_storage:/qdrant/storage   qdrant/qdrant
```

#### Start Redis

``` bash
docker run -d -p 6379:6379 redis
```

### 3️⃣ Install Dependencies

``` bash
npm install
```

### 4️⃣ Environment Variables

Create a `.env` file:

    JINA_API_KEY=your_jina_api_key
    GEMINI_API_KEY=your_gemini_api_key

### 5️⃣ Ingest News Articles

``` bash
node ingest.js
```

Expected output:

    ✅ Ingestion complete! Articles indexed.

### 6️⃣ Start the Server

``` bash
node server.js
```

Server runs at:\
**http://localhost:3000**

## 📡 API Endpoints

### **POST /api/chat**

Request:

``` json
{
  "sessionId": "uuid",
  "message": "What’s the latest in AI?"
}
```

Response:

``` json
{
  "reply": "Here is the latest update..."
}
```

### **GET /api/session/:sessionId**

Retrieve chat history.

### **DELETE /api/session/:sessionId**

Clear chat history.

## 🧠 Design Decisions

### ✔ Qdrant for Vector Search

Fast cosine similarity search with easy Docker deployment.

### ✔ Redis for Session Storage

Low latency, per-session history, 24-hour TTL for auto-cleanup.

### ✔ Jina Embeddings v2

Accurate embeddings with simple API integration.

## 📝 Summary

This backend provides a clean, modular, and scalable RAG system using
modern AI tools. It supports semantic search, grounded chat responses,
and efficient session handling.
