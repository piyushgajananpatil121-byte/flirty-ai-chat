import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { user, crush, gender, ageGroup, message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const prompt = `You are ${crush}, a flirty ${gender} AI companion chatting with ${user} in the ${ageGroup} age group. Respond playfully and flirty to: "${message}"`;

    const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt, options: { wait_for_model: true } }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: errorText });
    }

    const data = await response.json();
    let reply = data[0]?.generated_text?.replace(prompt, '').trim() || "Sorry, no response.";

    if (reply.length > 300) reply = reply.slice(0, 300) + '...';

    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

