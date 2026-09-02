import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const documentsPath = path.join(process.cwd(), "documents");

const files = fs.readdirSync(documentsPath);

let chunks = [];

for (const file of files) {

    const filePath = path.join(documentsPath, file);

    const content = fs.readFileSync(filePath, "utf-8");

    const paragraphs = content
        .split("\n\n")
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

for (const chunk of chunks) {

    const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: chunk.text
    });

    chunk.embedding = response.embeddings[0].values;

    console.log(`Embedded chunk ${chunk.chunkIndex} from ${chunk.source}`);
}

console.log(chunks);