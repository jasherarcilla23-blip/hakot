import fs from "fs";
import { cosine, embed } from "./embeddings";
import { knowledgePath, SearchResult, StoredChunk } from "./knowledge";

function loadKnowledge(): StoredChunk[] {
  let content: string;
  try {
    content = fs.readFileSync(knowledgePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.warn("No knowledge.json found. Ingest documents and restart the server.");
      return [];
    }
    throw error;
  }
  const data: unknown = JSON.parse(content);
  if (!Array.isArray(data) || !data.every(chunk =>
    chunk && typeof chunk.text === "string" && typeof chunk.title === "string" &&
    (chunk.locator === undefined || typeof chunk.locator === "string") &&
    Array.isArray(chunk.embedding) && chunk.embedding.length > 0 &&
    chunk.embedding.every((value: unknown) => typeof value === "number" && Number.isFinite(value)),
  )) throw new Error("Invalid knowledge.json");
  return data as StoredChunk[];
}
const knowledge = loadKnowledge();

export async function search(question: string, k = 3): Promise<SearchResult[]> {
  if (knowledge.length === 0 || k <= 0) return [];
  const [questionVector] = await embed([question]);
  return knowledge.map(chunk => ({
    text: chunk.text,
    title: chunk.title,
    ...(chunk.locator ? { locator: chunk.locator } : {}),
    score: cosine(questionVector, chunk.embedding),
  })).sort((a, b) => b.score - a.score).slice(0, k);
}

// Re-tune against real document score distributions before trusting 0.6.
export function hasReliableMatch(results: Array<{ score: number }>): boolean {
  return results.length > 0 && results[0].score >= 0.6;
}