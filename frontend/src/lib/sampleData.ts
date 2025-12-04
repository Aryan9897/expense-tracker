import { Expense, ExpenseTotals } from '../types/expense';

export const sampleExpenses: Expense[] = [
  {
    id: 'exp-1',
    merchant: 'Whole Foods',
    category: 'Groceries',
    amount: 84.75,
    date: '2024-10-03',
    status: 'cleared',
    source: 'receipt'
  },
  {
    id: 'exp-2',
    merchant: 'Lyft',
    category: 'Transport',
    amount: 26.4,
    date: '2024-10-02',
    status: 'pending',
    source: 'manual'
  },
  {
    id: 'exp-3',
    merchant: 'Adobe',
    category: 'Software',
    amount: 19.99,
    date: '2024-10-01',
    status: 'cleared',
    source: 'manual'
  },
  {
    id: 'exp-4',
    merchant: 'Blue Bottle',
    category: 'Coffee',
    amount: 7.5,
    date: '2024-09-30',
    status: 'cleared',
    source: 'receipt'
  }
];

export const computeTotals = (expenses: Expense[]): ExpenseTotals => {
  const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pending = expenses
    .filter((e) => e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);
  const receiptCount = expenses.filter((e) => e.source === 'receipt').length;

  return { spent, pending, receiptCount };
};
