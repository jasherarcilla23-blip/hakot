import fs from "fs";
import { cosine } from "./embeddings";

const knowledge = JSON.parse(fs.readFileSync("/home/saint/Documents/hakot/src/knowledge.json", "utf-8"));

export function search(question: string, k = 3): Array<{ text: string; title?: string; locator?: string; score: number }> {
 const questionVector = await embed([question]);
 const results = knowledge.map((chunk) => ({
 ...chunk,
 score: cosine(questionVector[0], chunk.embedding),
 }));
 return results.sort((a, b) => b.score - a.score).slice(0, k);
}

export function hasReliableMatch(results: Array<{ score: number }>): boolean {
 return results[0].score >= 0.6;
}
