export default async function handler(req, res) {
  // --- CORS FIX (Allow All Origins) ---
  res.setHeader('Access-Control-Allow-Origin', '*'); // allow all origins
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // --- Your API Logic ---
  try {
    const { message } = req.body;

    // Example: Call your AI or chat logic here
    const reply = `AI Response: You said "${message}"`;

    res.status(200).json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

