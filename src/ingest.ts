import { embed } from "./embeddings";
import fs from "fs";

export async function ingest(filePath: string): Promise<void> {
 const fileContent = fs.readFileSync(filePath, "utf-8");
 const chunks = chunkFile(fileContent);
 const embeddings = await embed(chunks.map((c) => c.text));
 const knowledge = chunks.map((c, i) => ({ ...c, embedding: embeddings[i] }));
 fs.writeFileSync("/home/saint/Documents/hakot/src/knowledge.json", JSON.stringify(knowledge));
}

function chunkFile(content: string): Array<{ text: string; title?: string; locator?: string }> {
 // Implementation depends on document type (heading-based or paragraph-based)
 return []; // Placeholder
}
