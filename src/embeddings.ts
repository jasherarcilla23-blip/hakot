import axios from "axios";

const OLLAMA_URL = "http://localhost:11434";

export async function embed(texts: string[]): Promise<number[][]> {
 const response = await axios.post(`${OLLAMA_URL}/api/embed`, {
 model: "nomic-embed-text",
 texts,
 });
 return response.data;
}

export function cosine(a: number[], b: number[]): number {
 if (a.length !== b.length) throw new Error("Vector length mismatch");
 const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
 const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
 const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
 return dotProduct / (magnitudeA * magnitudeB);
}
