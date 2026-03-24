import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    const results = (await redis.get("quiz-results")) || [];
    return res.status(200).json(results);
  }

  if (req.method === "POST") {
    const entry = req.body;
    if (!entry || typeof entry.x !== "number" || typeof entry.y !== "number" || !entry.key) {
      return res.status(400).json({ error: "Invalid entry" });
    }
    const results = (await redis.get("quiz-results")) || [];
    const idx = entry.name
      ? results.findIndex(r => r.name && r.name.toLowerCase() === entry.name.toLowerCase())
      : -1;
    if (idx >= 0) results[idx] = entry;
    else results.push(entry);
    await redis.set("quiz-results", results);
    return res.status(200).json(results);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
