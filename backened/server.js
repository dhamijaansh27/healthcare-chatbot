import express from "express";
import cors from "cors";  
import dotenv from "dotenv";
import rag from "./rag.js";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const app = express();
app.use(cors());
app.use(express.json());

const  PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("HealthCare Chatbot Backend is running");
});

app.post("/chat", async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const answer = await rag(message, history || []);

        res.json({
            reply: answer
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Something went wrong"
        });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});