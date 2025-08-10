export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const HF_API_TOKEN = process.env.HF_API_TOKEN;
  if (!HF_API_TOKEN) {
    return res.status(500).json({ error: 'Missing HF_API_TOKEN environment variable' });
  }

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();

    if (!data || !Array.isArray(data) || !data[0]?.generated_text) {
      return res.status(200).json({ reply: "Sorry, I couldn't come up with a response." });
    }

    return res.status(200).json({ reply: data[0].generated_text });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

