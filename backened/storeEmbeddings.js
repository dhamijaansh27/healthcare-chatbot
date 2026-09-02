import { ChromaClient } from "chromadb";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const chroma = new ChromaClient({
    host: "localhost",
    port: 8000,
    ssl: false
});

const documentsPath = path.join(process.cwd(), "documents");

const files = fs.readdirSync(documentsPath);

let chunks = [];

// 1. Read documents and create chunks
for (const file of files) {

    const filePath = path.join(documentsPath, file);

    const content = fs.readFileSync(filePath, "utf-8");

    const paragraphs = content
        .split(/\r?\n\r?\n/)
        .map(text => text.trim())
        .filter(text => text.length > 0);

    paragraphs.forEach((paragraph, index) => {

        chunks.push({
            text: paragraph,
            source: file,
            chunkIndex: index
        });

    });
}

console.log(`Total chunks: ${chunks.length}`);

// 2. Get/create Chroma collection
const collection = await chroma.getOrCreateCollection({
    name: "healthcare_knowledge"
});

// 3. Generate embeddings
for (const chunk of chunks) {

    const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: chunk.text
    });

    const embedding = response.embeddings[0].values;

    // 4. Store in ChromaDB
    await collection.add({
        ids: [`${chunk.source}-${chunk.chunkIndex}`],

        embeddings: [embedding],

        documents: [chunk.text],

        metadatas: [{
            source: chunk.source,
            chunkIndex: chunk.chunkIndex
        }]
    });

    console.log(`Stored: ${chunk.source} - ${chunk.chunkIndex}`);
}

console.log("All embeddings stored successfully!");