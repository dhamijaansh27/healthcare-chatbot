import fs from "fs";
import path from "path";

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

console.log(chunks);