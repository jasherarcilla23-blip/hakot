import axios from "axios";

const OLLAMA_URL = "http://localhost:11434";

export async function callLLM(systemPrompt: string, userContent: string, model = "qwen2.5:3b"): Promise<string> {
 const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
 model,
 system: systemPrompt,
 prompt: userContent,
 temperature: 0,
 stream: false,
 });
 return response.data.response;
}
