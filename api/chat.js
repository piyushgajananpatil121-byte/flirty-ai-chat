// File: api/chat.js
// Uses global fetch (Node 18+). Works as a Vercel Serverless Function.
// Handles CORS preflight and dynamic origin allowance.

export default async function handler(req, res) {
  // === CONFIG ===
  // For quick fix: allow any origin (development). For production, replace '*' with specific allowed origins.
  const ALLOW_ALL_ORIGINS = true; // set to false to restrict
  const ALLOWED_ORIGINS = [
    'https://piyushgajananpatil121-byte.github.io',
    'https://flirty-ai-chat-aw9cqwc7r-piyushs-projects-65115964.vercel.app',
    'https://flirty-ai-chat-jvknbuh64-piyushs-projects-65115964.vercel.app',
    // add more hosts you use
  ];
  // ==============

  const origin = req.headers.origin || '';

  if (ALLOW_ALL_ORIGINS) {
    // Return the request origin — avoids wildcard for credentialed requests.
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // parse body - Vercel/Node will provide req.body for JSON POST
    const { user = 'You', crush = 'Crush', gender = 'neutral', ageGroup = 'unknown', message } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const prompt = `You are ${crush}, a flirty ${gender} AI companion chatting with ${user} who is in the ${ageGroup} age group. Reply playfully and flirty but keep it appropriate and short to the message: "${message}"`;

    // Call Hugging Face Inference API
    const hfResponse = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        options: { wait_for_model: true },
      }),
    });

    if (!hfResponse.ok) {
      const errText = await hfResponse.text();
      return res.status(500).json({ error: `HuggingFace error: ${errText}` });
    }

    const hfData = await hfResponse.json();

    // Response format for HF text-gen models is often an array with generated_text
    let generated = '';
    if (Array.isArray(hfData) && hfData[0]?.generated_text) {
      generated = hfData[0].generated_text;
    } else if (hfData.generated_text) {
      generated = hfData.generated_text;
    } else {
      // fallback: maybe model returns text directly
      generated = String(hfData).slice(0, 1000);
    }

    // Remove prompt echo if present
    let reply = generated.replace(prompt, '').trim();
    if (!reply) reply = generated.trim();

    // Limit length
    if (reply.length > 400) reply = reply.slice(0, 400) + '...';

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Error in /api/chat:', err);
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}
