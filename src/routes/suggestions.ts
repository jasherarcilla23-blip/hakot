import express from "express";
import { sanitizeQuestion } from "../rag";
import { saveSuggestion } from "../suggestions";

const router = express.Router();
const limits = new Map<string, { count: number; resetAt: number }>();
const cleanup = setInterval(() => {
  for (const [ip, entry] of limits) if (Date.now() >= entry.resetAt) limits.delete(ip);
}, 60000);
cleanup.unref();

router.post("/suggestions", async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = limits.get(ip);
  const current = !entry || now >= entry.resetAt ? { count: 0, resetAt: now + 60000 } : entry;
  limits.set(ip, current);
  if (++current.count > 10) {
    res.status(429).json({ error: "Rate limit exceeded" });
    return;
  }
  const raw = req.body?.question;
  if (typeof raw !== "string" || raw.length >= 300 || req.body?.consent !== true) {
    res.status(400).json({ error: "Invalid suggestion" });
    return;
  }
  const question = sanitizeQuestion(raw);
  if (!question) {
    res.status(400).json({ error: "Invalid suggestion" });
    return;
  }
  try {
    const record = await saveSuggestion(question);
    res.status(201).json({ id: record.id, status: record.status });
  } catch (error) {
    console.error("Cannot save suggestion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
export default router;