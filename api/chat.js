import fetch from 'node-fetch';

const HUGGINGFACE_API_TOKEN = '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'; // your token here

export async function POST(request) {
  try {
    const { user, crush, gender, ageGroup, message } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'No message provided' }), { status: 400 });
    }

    // Build a prompt based on user data to make chat flirty and personal
    const prompt = `
You are ${crush}, a flirty ${gender} AI chat companion chatting with ${user} who is in the ${ageGroup} age group.
Respond in a playful, flirty, and engaging way to the message:
"${message}"
Keep replies short, sweet, and appropriate.
`;

    const apiResponse = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        options: { wait_for_model: true },
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return new Response(JSON.stringify({ error: errorText }), { status: 500 });
    }

    const apiData = await apiResponse.json();

    if (!apiData || !apiData[0] || !apiData[0].generated_text) {
      return new Response(JSON.stringify({ error: 'No valid response from AI' }), { status: 500 });
    }

    // Extract AI reply by removing prompt from the generated text
    let generatedText = apiData[0].generated_text;
    let reply = generatedText.replace(prompt, '').trim();

    // Limit reply length and sanitize
    if (reply.length > 300) reply = reply.slice(0, 300) + '...';

    return new Response(JSON.stringify({ reply }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
