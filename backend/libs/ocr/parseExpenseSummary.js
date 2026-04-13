// libs/ocr/parseExpenseSummary.js

/**
 * Extracts JSON from an LLM response that may be wrapped in markdown code fences.
 * Returns a structured expense object, or {} if parsing fails.
 */
export const parseOcrResponse = (text) => {
  if (!text) return null;

  // Strip markdown code fences if present
  const stripped = text.replace(/```(?:json)?\n?/g, "").trim();

  try {
    const parsed = JSON.parse(stripped);
    return {
      merchant: parsed.merchant ?? null,
      amount: parsed.amount ?? null,
      date: parsed.date ?? null,
      category: parsed.category ?? null
    };
  } catch {
    return null;
  }
};
