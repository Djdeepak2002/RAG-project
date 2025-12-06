
# RAG Frontend

A React-based frontend for the RAG news chatbot. Connects to the backend to provide a conversational interface for news Q&A.

## Features

- **Chat UI**: Modern, responsive chat window for interacting with the news bot.
- **Session Persistence**: Remembers user session and chat history.
- **Markdown Rendering**: Bot replies support markdown formatting.
- **Clear History**: Button to reset chat and start a new session.
- **Loading States**: Shows typing indicator while waiting for bot response.

## Installation

1. **Install dependencies**  
	```
	cd rag-frontend
	npm install
	```

2. **Start the development server**  
	```
	npm run dev
	```
	The app runs at `http://localhost:5173` (default Vite port).

3. **Configure backend URL**  
	Ensure `API_URL` in `src/App.jsx` matches your backend (default: `http://localhost:3000/api`).

## Main Functionalities

- **Send Message**: User types a question, which is sent to `/api/chat` on the backend.
- **Display History**: Loads previous messages from `/api/session/:sessionId`.
- **Clear Session**: Calls `DELETE /api/session/:sessionId` to reset chat.

## Technologies

- React, Vite, Axios, React Markdown, UUID
