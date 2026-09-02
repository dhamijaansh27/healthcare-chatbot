import { ChromaClient } from "chromadb";

const chroma = new ChromaClient({
    path: "http://localhost:8000"
});

await chroma.deleteCollection({
    name: "healthcare_knowledge"
});

console.log("Collection deleted");