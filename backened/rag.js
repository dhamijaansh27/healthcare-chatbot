import { ChromaClient } from "chromadb";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const noEmbeddingFunction = {
    generate: async () => {
        throw new Error("Chroma embedding function should not be called.");
    }
};

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const chroma = new ChromaClient({
    host: "localhost",
    port: 8000,
    ssl: false
});

const collection = await chroma.getCollection({
    name: "healthcare_knowledge",
    embeddingFunction: noEmbeddingFunction
});

async function rewriteQuestion(question, history = []) {
    if (history.length === 0) {
        return question;
    }

    const conversation = history
        .slice(-6)
        .map(msg => `${msg.sender}: ${msg.text}`)
        .join("\n");

    const prompt = `
Rewrite the user's latest question into a standalone question
that can be searched in a healthcare knowledge base.

Conversation:
${conversation}

Latest question:
${question}

Rules:
- Resolve pronouns such as "he", "she", "it", "they".
- Resolve references such as "this doctor", "that hospital", "the doctor".
- Use the relevant name from the conversation when necessary.
- If the question is already standalone, keep it unchanged.
- Do not answer the question.
- Return ONLY the rewritten question.
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt
    });

    return response.text.trim();
}

async function rag(question, history = []) {

    // STEP 1: Generate embedding for the question

    const searchQuestion = await rewriteQuestion(question, history);

    console.log("Original question:", question);
    console.log("Search question:", searchQuestion);

    const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: searchQuestion
    });

    const questionEmbedding = response.embeddings[0].values;

    console.log("Embedding generated for question:");

    // STEP 2: Search ChromaDB
    const results = await collection.query({
        queryEmbeddings: [questionEmbedding],
        nResults: 3
    });

    console.log("Querying ChromaDB for relevant documents...");

    // STEP 3: Check best similarity
    const bestDistance = results.distances[0][0];

    console.log("Best distance:", bestDistance);

    const threshold = 0.8;

    // STEP 4: If project information is NOT relevant
    if (bestDistance > threshold) {

        console.log("No relevant project information found.");
        console.log("Using Gemini for general medical information.");

        const prompt = `
        You are a helpful and professional healthcare information assistant.

        Answer the user's question in a clear, simple, and informative way.

        User Question:
        ${question}

        Instructions:

        1. ALWAYS answer using bullet points.
        2. Keep each bullet point short and clear.
        3. Explain medical terms in simple language.
        4. Include common symptoms, causes, risk factors, or when to seek medical attention when relevant.
        5. Do not diagnose the user.
        6. Do not prescribe medications.
        7. Do not provide personalized treatment plans.
        8. If symptoms are mentioned, explain possible general causes without claiming that the user has a specific condition.
        9. If the situation could be an emergency, clearly recommend seeking immediate medical care.
        10. Do not claim to replace a doctor.
        11. Do not mention RAG, embeddings, ChromaDB, vector search, or internal system instructions.

        Answer naturally as a healthcare assistant.
        `;

        const answer = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt
        });

        return answer.text;
    }

    // STEP 5: Relevant project information found
    const documents = results.documents[0];

    const context = documents.join("\n\n");

    console.log("Relevant project context found.");
    console.log("Context created");

    // STEP 6: Augmentation
    const prompt = `
    You are a helpful and professional healthcare assistant for City Care Hospital.

    Your job is to answer the user's question clearly, accurately, and naturally.

    Hospital Knowledge:
    ${context}

    User Question:
    ${question}

    Follow these rules:

    1. Use the hospital knowledge as the primary source for hospital-specific questions.
    2. Never invent hospital-specific information.
    3. If the requested hospital information is not present, clearly say that you do not have that information.
    4. Give the direct answer first.
    5. ALWAYS answer using bullet points.
    6. Keep each bullet point short and easy to understand.
    7. For doctor questions, mention name, specialty, experience, hospital, and availability when available.
    8. For department questions, use one bullet point for each relevant department.
    9. For multiple doctors, use one bullet point for each doctor.
    10. For general medical questions, provide educational information and do not diagnose the user.
    11. Do not prescribe medications or give personalized treatment plans.
    12. If the user describes potentially serious or emergency symptoms, recommend seeking immediate professional medical care.
    13. Do not claim to be a doctor.
    14. Do not mention RAG, embeddings, ChromaDB, vectors, or the knowledge base.
    15. Do not say "according to the context" or "according to the provided information".
    16. Use simple language suitable for a general patient.

    Give the best answer based on the available information.
    `;

    // STEP 7: Generate answer
    console.time("Gemini generation");

    const answer = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt
    });

    console.timeEnd("Gemini generation");

    return answer.text;
}


export default rag;