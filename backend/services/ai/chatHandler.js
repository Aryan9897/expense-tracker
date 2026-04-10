import { errorResponse, jsonResponse } from "../../libs/http/response.js";
import { verifyAuth } from "../../libs/auth/index.js";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const CHAT_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
const MAX_EXPENSES = 200;
const MAX_HISTORY = 20;

function buildExpenseContext(expenses) {
  if (!expenses.length) {
    return "This user has no expenses recorded yet.";
  }

  const sorted = expenses
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, MAX_EXPENSES);

  const total = sorted.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const note =
    expenses.length > MAX_EXPENSES
      ? `Note: Only the most recent ${MAX_EXPENSES} expenses are shown. The user has ${expenses.length} total expenses.\n`
      : "";

  const lines = sorted.map(
    (e) =>
      `- $${Number(e.amount).toFixed(2)} at ${e.merchant} (${e.category}) on ${e.date} [${e.status}, source: ${e.source}]`
  );

  return `${note}The user has ${sorted.length} expenses totaling $${total.toFixed(2)}\n${lines.join("\n")}`;
}

export const handler = async (event) => {
  try {
    const auth = await verifyAuth(event);
    if (auth.error) return auth.error;

    const body = JSON.parse(event.body || "{}");
    const { message, expenses: rawExpenses, conversationHistory: rawHistory } = body;

    if (!message || !message.trim()) {
      return errorResponse(400, "Missing message");
    }

    const expenses = Array.isArray(rawExpenses) ? rawExpenses : [];
    const history = Array.isArray(rawHistory)
      ? rawHistory.slice(-MAX_HISTORY)
      : [];

    const expenseContext = buildExpenseContext(expenses);

    const systemPrompt = `You are an expense assistant for an expense tracking app. Your job is to help the user understand their spending by answering questions about their expense data.

RULES:
1. You can ONLY answer questions about the expense data provided below. Do not make up expenses, totals, dates, or any other information.
2. Do NOT answer questions about the user's profile, personal information, or anything unrelated to expenses.
3. If the data does not contain enough information to answer, say so clearly.
4. If the user's question is ambiguous (e.g., "last month" could mean different months), ask a clarifying question.
5. Keep answers concise and helpful.
6. When listing expenses, format them in a readable way.
7. When doing calculations (totals, averages, counts), show your work briefly so the user can verify.
8. Today's date is ${new Date().toISOString().split("T")[0]} — use this to interpret relative dates like "this month" or "last week".

USER'S EXPENSE DATA:
${expenseContext}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message.trim() }
    ];

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("Missing OPENROUTER_API_KEY env var");
      return errorResponse(500, "Internal server error");
    }

    const res = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model: CHAT_MODEL, messages })
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`OpenRouter error ${res.status}:`, errBody);
      return errorResponse(500, "Failed to process chat message");
    }

    const data = await res.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "I wasn't able to process your question. Please try again.";

    return jsonResponse(200, { reply });
  } catch (err) {
    console.error("chatHandler error", err);
    return errorResponse(500, "Failed to process chat message");
  }
};
