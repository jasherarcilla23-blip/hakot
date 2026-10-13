import axios from "axios";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

export async function callLLM(
  systemPrompt: string,
  userContent: string,
  model = "qwen3.5:4b",
): Promise<string> {
  const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
    model,
    system: systemPrompt,
    prompt: userContent,
    stream: false,
    think: false,
    options: { temperature: 0 },
  }, { timeout: 120000 });
  if (typeof response.data.response !== "string") throw new Error("Invalid generation response");
  return response.data.response;
}