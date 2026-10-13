import express from "express";
import { search } from "../search";

const router = express.Router();
const rateLimitMap = new Map<string, number>();

router.post("/ask", (req, res) => {
 const ip = req.ip;
 const count = rateLimitMap.get(ip) ?? 0;
 if (count >= 30) return res.status(429).json({ error: "Rate limit exceeded" });
 rateLimitMap.set(ip, count + 1);

 const question = req.body.question;
 if (typeof question !== "string" || question.trim().length === 0) {
 return res.status(400).json({ error: "Invalid question" });
 }

 try {
 const results = search(question, 3);
 res.json({ answer: "Placeholder answer", sources: results });
 } catch (err) {
 console.error(err);
 res.status(500).json({ error: "Internal server error" });
 }
});

export default router;
