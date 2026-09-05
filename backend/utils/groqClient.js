// Minimal client for Groq's free-tier chat completions API (OpenAI-compatible
// schema) - no SDK dependency needed, just fetch. Get a free API key at
// https://console.groq.com and set GROQ_API_KEY in your environment.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Groq deprecated its llama-3.x chat models in 2026 - openai/gpt-oss-120b is
// their current recommended general-purpose replacement (still free-tier).
// If you hit a "model_decommissioned" error again in the future, check
// https://console.groq.com/docs/deprecations for the current model to swap in.
// Groq deprecated its llama-3.x chat models in 2026 - openai/gpt-oss-120b is
// their current recommended general-purpose replacement (still free-tier).
// A fallback is included so a future deprecation doesn't silently break the
// chatbot again; check https://console.groq.com/docs/deprecations if both
// of these ever start failing.
const MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];

export const askGroq = async (messages) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set - the chatbot needs a free Groq API key to work.");
  }

  let lastError;
  for (const model of MODELS) {
    try {
      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({ model, messages, temperature: 0.3, max_tokens: 500 }),
      });

      if (!response.ok) {
        const text = await response.text();
        // model-specific failure (decommissioned/not found) - try the next one
        if (response.status === 404) {
          lastError = new Error(`Groq API error (${response.status}) for model "${model}": ${text}`);
          continue;
        }
        throw new Error(`Groq API error (${response.status}): ${text}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || "";
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
};
