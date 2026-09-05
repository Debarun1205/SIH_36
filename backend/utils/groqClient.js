// Minimal client for Groq's free-tier chat completions API (OpenAI-compatible
// schema) - no SDK dependency needed, just fetch. Get a free API key at
// https://console.groq.com and set GROQ_API_KEY in your environment.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export const askGroq = async (messages) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set - the chatbot needs a free Groq API key to work.");
  }

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq API error (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
};
