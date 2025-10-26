export type Expense = {
  userId: string;
  sk: string; // "expense#<ISO8601>"
  amount: number;
  currency?: "USD" | "EUR";
  category?: string;
  merchant?: string;
  note?: string;
  source: "manual" | "ocr";
  receiptS3Key?: string;
  breakdown?: { item: string; qty?: number; price: number }[];
  tax?: number;
};

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };
