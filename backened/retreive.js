import { ChromaClient } from "chromadb";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const chroma = new ChromaClient({
    path: "http://localhost:8000"
});

const collection = await chroma.getCollection({
    name: "healthcare_knowledge"
});

const question = "Who treats heart problems?";

// Convert question into embedding
const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: question
});

const questionEmbedding = response.embeddings[0].values;

// Search ChromaDB
const results = await collection.query({
    queryEmbeddings: [questionEmbedding],
    nResults: 3
});

console.log(results);