// libs/ocr/openrouter.js
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "nvidia/nemotron-nano-12b-v2-vl:free";

const PROMPT = `You are an expense receipt parser. Analyze this receipt image and extract the following fields as JSON:
- merchant: the store/restaurant/vendor name
- amount: the total amount as a number (no currency symbol)
- date: the date in YYYY-MM-DD format
- category: one of [Food, Transport, Shopping, Entertainment, Health, Utilities, Other]

Return ONLY valid JSON: {"merchant": "...", "amount": 12.50, "date": "2024-01-15", "category": "Food"}
If a field cannot be determined, use null.`;

export const analyzeReceipt = async (imageBase64, contentType) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY env var");

  const res = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${contentType};base64,${imageBase64}` }
            },
            { type: "text", text: PROMPT }
          ]
        }
      ]
    })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenRouter");
  return content;
};
