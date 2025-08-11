export async function POST(request) {
  const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

  try {
    const { user, crush, gender, ageGroup, message } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'No message provided' }), { status: 400 });
    }

    const prompt = `You are ${crush}, a flirty ${gender} AI chat companion chatting with ${user} who is in the ${ageGroup} age group. Respond in a playful, flirty, and engaging way to the message: "${message}" Keep replies short, sweet, and appropriate.`;

    const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
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

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: errorText }), { status: 500 });
    }

    const data = await response.json();

    if (!data || !data[0] || !data[0].generated_text) {
      return new Response(JSON.stringify({ error: 'No valid response from AI' }), { status: 500 });
    }

    let generatedText = data[0].generated_text;
    let reply = generatedText.replace(prompt, '').trim();

    if (reply.length > 300) reply = reply.slice(0, 300) + '...';

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
