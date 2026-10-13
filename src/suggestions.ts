import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { normalizeForRetrieval } from "./normalize";

export const suggestionsPath = path.resolve(process.env.SUGGESTIONS_PATH || "data/suggestions.jsonl");
export interface Suggestion {
  id: string;
  question: string;
  createdAt: string;
  status: "pending";
}
let writes: Promise<unknown> = Promise.resolve();

export function saveSuggestion(question: string, filePath = suggestionsPath): Promise<Suggestion> {
  const record: Suggestion = { id: randomUUID(), question, createdAt: new Date().toISOString(), status: "pending" };
  const write = writes.then(async () => {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.appendFile(filePath, JSON.stringify(record) + "\n", "utf8");
    return record;
  });
  writes = write.catch(() => undefined);
  return write;
}

export async function readSuggestions(filePath = suggestionsPath): Promise<Suggestion[]> {
  try {
    const text = await fs.readFile(filePath, "utf8");
    return text.split("\n").filter(Boolean).map(line => JSON.parse(line) as Suggestion);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

if (require.main === module) {
  readSuggestions().then(records => {
    const groups = new Map<string, { question: string; submissions: number; lastSubmitted: string }>();
    for (const record of records) {
      const key = normalizeForRetrieval(record.question).toLowerCase();
      const current = groups.get(key);
      groups.set(key, { question: current?.question || record.question, submissions: (current?.submissions || 0) + 1,
        lastSubmitted: record.createdAt });
    }
    // JSON keeps untrusted questions as data, including any quoted instructions.
    console.log(JSON.stringify({
      totalSubmissions: records.length,
      questions: [...groups.values()].sort((a, b) => b.submissions - a.submissions),
    }, null, 2));
  }).catch(error => { console.error("Cannot read suggestions:", error); process.exitCode = 1; });
}