import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import './styles.scss';

// Ensure this matches your backend URL
const API_URL = 'http://localhost:3000/api';

function App() {
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // 1. Initialize Session
  useEffect(() => {
    // Check if we already have a session in local storage
    let storedSession = localStorage.getItem('chat_session_id');
    if (!storedSession) {
      storedSession = uuidv4();
      localStorage.setItem('chat_session_id', storedSession);
    }
    setSessionId(storedSession);

    // Fetch history for this session
    fetchHistory(storedSession);
  }, []);

  // 2. Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // const fetchHistory = async (id) => {
  //   try {
  //     const res = await axios.get(`${API_URL}/session/${id}`);
  //     setMessages(res.data);
  //   } catch (err) {
  //     console.error("Failed to load history", err);
  //   }
  // };

const fetchHistory = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/session/${id}`);
      // Safety check: Only set messages if we actually got an array
      if (Array.isArray(res.data)) {
        setMessages(res.data);
      } else {
        console.warn("Backend returned non-array history:", res.data);
        setMessages([]); 
      }
    } catch (err) {
      console.error("Failed to load history", err);
      setMessages([]); // Fallback to empty list on error
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, {
        sessionId,
        message: userMessage.text
      });

      const botMessage = { sender: 'bot', text: res.data.reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error("Error sending message", err);
      setMessages(prev => [...prev, { sender: 'bot', text: "Error: Could not reach the server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to clear the chat history?")) return;
    try {
      await axios.delete(`${API_URL}/session/${sessionId}`);
      setMessages([]);
      // Optional: Generate new session ID
      const newId = uuidv4();
      localStorage.setItem('chat_session_id', newId);
      setSessionId(newId);
    } catch (err) {
      console.error("Error resetting session", err);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>📰 News RAG Chatbot</h1>
        <button className="reset-btn" onClick={handleReset}>Clear History</button>
      </header>

      <div className="chat-window">
        {Array.isArray(messages) && messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            {msg.sender === 'bot' ? (
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            ) : (
              msg.text
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="message bot loading">
            typing...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="input-area">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about the latest news..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;