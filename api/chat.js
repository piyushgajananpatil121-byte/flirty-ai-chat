export default async function handler(req, res) {
  // ---- CORS FIX ----
  res.setHeader('Access-Control-Allow-Origin', '*'); // allow all origins
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight request handling
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ---- Your API logic ----
  try {
    const { message } = req.body;

    // Example response (replace with AI logic)
    const reply = `AI Response: You said "${message}"`;

    res.status(200).json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


