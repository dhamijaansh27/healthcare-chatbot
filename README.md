# 🏥 Healthcare AI Chatbot

An AI-powered healthcare chatbot built using **React, Node.js, Express, Gemini API, and ChromaDB**.

The chatbot can answer **hospital-specific questions** using **Retrieval-Augmented Generation (RAG)** and also provide general healthcare information.

---

## ✨ Features

- 🤖 AI-powered healthcare assistant
- 🏥 Answers hospital-specific questions
- 👨‍⚕️ Provides information about doctors and their specialties
- 🏨 Provides hospital and department information
- 🚑 Provides emergency-related information
- 🧠 Uses Retrieval-Augmented Generation (RAG)
- 🔎 Semantic search using vector embeddings
- 💬 Supports conversational follow-up questions
- 📝 Responses are displayed using Markdown
- ⚕️ Provides general medical information without diagnosing patients

---

## 🧠 How It Works

The chatbot uses a **RAG-based architecture** to retrieve relevant healthcare information before generating a response.

```text
User
  ↓
React Frontend
  ↓
Express API
  ↓
Question Processing
  ↓
Gemini Embedding Model
  ↓
ChromaDB Vector Search
  ↓
Relevant Healthcare Information
  ↓
Gemini Generative Model
  ↓
AI Response
  ↓
React Chat Interface
```
---

## 📂 Project Structure

```text
healthcare-chatbot/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
└── README.md
```

