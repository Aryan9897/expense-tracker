export type Expense = {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  status: 'cleared' | 'pending';
  source: 'manual' | 'receipt';
};

export type ExpenseTotals = {
  spent: number;
  pending: number;
  receiptCount: number;
};
