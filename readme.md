# 📰 News RAG Chatbot -- Full Stack

A production-ready Retrieval-Augmented Generation (RAG) news chatbot web application, featuring a React-based frontend and a Node.js backend. The system ingests real-time news, stores semantic vectors, retrieves context, and generates grounded AI responses. Targeted at developers and users interested in search, knowledge management, and AI-powered conversational interfaces.

---

## Table of Contents
- [Project Title](#📰-news-rag-chatbot----full-stack)
- [Description](#description)
- [Features](#features)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)
- [Contact Information](#contact-information)

---

## Description
This project is a full-stack RAG web application. The backend ingests, embeds, and retrieves news articles, while the frontend provides a modern chat UI for interacting with the news bot. The system supports session persistence, markdown rendering, and real-time Q&A.

---

## Features

### Frontend
- **Chat UI**: Modern, responsive chat window for news Q&A.
- **Session Persistence**: Remembers user session and chat history.
- **Markdown Rendering**: Bot replies support markdown formatting.
- **Clear History**: Button to reset chat and start a new session.
- **Loading States**: Shows typing indicator while waiting for bot response.

### Backend
- **RAG Pipeline**: Fetches, chunks, embeds, and stores news articles.
- **Context-Aware Chat**: Retrieves top-k relevant articles and generates fact-based answers.
- **Session Management**: Chat history stored per session in Redis (TTL: 24 hours).
- **REST APIs**: For chat interactions and session management.

---

## Technologies
- **Frontend**: React, Vite, Axios, React Markdown, UUID
- **Backend**: Node.js (Express.js), Google Gemini, Jina Embeddings v2, Qdrant (Docker), Redis (Docker)

---

## Project Structure
```
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
rag-frontend/
│── src/
│     ├── App.jsx
│     ├── main.jsx
│     ├── styles.scss
│     └── assets/
│── public/
│── package.json
│── vite.config.js
└── README.md
```

---

## Installation

### Prerequisites
- Node.js v18+
- npm
- Docker (for backend services)

### Backend Setup
1. Navigate to the backend folder:
   ```sh
   cd rag-backend
   ```
2. Start Qdrant:
   ```sh
   docker run -d -p 6333:6333 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant
   ```
3. Start Redis:
   ```sh
   docker run -d -p 6379:6379 redis
   ```
4. Install dependencies:
   ```sh
   npm install
   ```
5. Create a `.env` file:
   ```env
   JINA_API_KEY=your_jina_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
6. Ingest news articles:
   ```sh
   node ingest.js
   ```
7. Start the server:
   ```sh
   node server.js
   ```
   Server runs at: http://localhost:3000

### Frontend Setup
1. Navigate to the frontend folder:
   ```sh
   cd rag-frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
   The app runs at `http://localhost:5173` (default Vite port).
4. Configure backend URL:
   Ensure `API_URL` in `src/App.jsx` matches your backend (default: `http://localhost:3000/api`).

---

## Usage

### Example Workflow
1. Ingest documents using the backend API or UI.
2. Query the system for relevant information.
3. View results in the frontend interface.

### Main Functionalities
- **Send Message**: User types a question, which is sent to `/api/chat` on the backend.
- **Display History**: Loads previous messages from `/api/session/:sessionId`.
- **Clear Session**: Calls `DELETE /api/session/:sessionId` to reset chat.

---

## Configuration

### Backend
- Configuration options can be set via environment variables or by editing configuration files in `rag-backend`.
- Example environment variables:
  ```env
  PORT=3000
  JINA_API_KEY=your_jina_api_key
  GEMINI_API_KEY=your_gemini_api_key
  ```
- To set environment variables, create a `.env` file in `rag-backend` and add your variables.

### Frontend
- Update API endpoints in `src/App.jsx` if your backend runs on a custom port or domain.
- Example:
  ```js
  // src/App.jsx
  const API_URL = 'http://localhost:3000/api';
  ```

---

## API Endpoints

### **POST /api/chat**
Request:
```json
{
  "sessionId": "uuid",
  "message": "What’s the latest in AI?"
}
```
Response:
```json
{
  "reply": "Here is the latest update..."
}
```

### **GET /api/session/:sessionId**
Retrieve chat history.

### **DELETE /api/session/:sessionId**
Clear chat history.

---

## Contributing
We welcome contributions! Please follow these guidelines:
- Fork the repository and create your branch from `main`.
- Use clear, descriptive commit messages.
- Adhere to existing coding standards and style guides.
- Submit pull requests with a clear description of changes.
- For major changes, open an issue first to discuss your proposal.

---

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact Information
For support or inquiries, please contact:
- **Project Maintainer:** [Your Name]
- **Email:** your.email@example.com
- **GitHub Issues:** [Open an issue](https://github.com/yourusername/rag-project/issues)
