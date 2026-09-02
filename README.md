🏥 Healthcare AI Chatbot

An AI-powered healthcare chatbot built using React, Node.js, Express, Gemini API, and ChromaDB.

The chatbot can answer hospital-specific questions using Retrieval-Augmented Generation (RAG) and also provide general healthcare information.

✨ Features
🤖 AI-powered healthcare assistant
🏥 Answers hospital-specific questions
👨‍⚕️ Provides information about doctors and their specialties
🏨 Provides hospital and department information
🚑 Provides emergency-related information
🧠 Uses Retrieval-Augmented Generation (RAG)
🔎 Semantic search using vector embeddings
💬 Supports conversational follow-up questions
📝 Responses are displayed using Markdown bullet points
⚕️ Provides general medical information without diagnosing patients
🧠 How It Works

The chatbot uses a RAG-based architecture:

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


⚙️ Installation
1. Clone the repository
git clone https://github.com/dhamijaansh27/healthcare-chatbot.git
cd healthcare-chatbot
2. Backend Setup
cd backend
npm install

Create a .env file:

GEMINI_API_KEY=your_api_key_here

Start the backend:

node server.js

The backend will run on:

http://localhost:5000
3. Start ChromaDB

Make sure ChromaDB is running on:

http://localhost:8000
4. Frontend Setup

Open another terminal:

cd frontend
npm install
npm run dev

The frontend will normally be available at:

http://localhost:5173
