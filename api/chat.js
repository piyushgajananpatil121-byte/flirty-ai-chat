export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    const { message } = req.body || {};
    return res.status(200).json({ reply: `AI says: ${message || "No message"}` });
  }

  res.status(405).json({ error: "Method not allowed" });
}

