import { FormEvent, useEffect, useState } from 'react';
import { Expense } from '../types/expense';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DEFAULT_FORM = {
  merchant: '',
  category: 'Groceries',
  amount: '',
  date: '',
  status: 'pending',
  customCategory: '',
};

export const sortByDateDesc = (list: Expense[]) =>
  [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const mapExpense = (item: any): Expense => ({
  id: item.expenseId ?? item.id,
  merchant: item.merchant,
  category: item.category,
  amount: item.amount,
  date: item.date,
  status: item.status,
  source: item.source,
});

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [categories, setCategories] = useState(['Groceries', 'Transport', 'Software', 'Coffee']);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    if (!user) throw new Error('Not authenticated');
    const token = await user.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  useEffect(() => {
    if (!API_BASE_URL || !user) return;

    const fetchExpenses = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/expenses`, { headers });
        if (!res.ok) {
          console.error('Failed to load expenses', await res.text());
          return;
        }
        const items = await res.json();
        setExpenses(sortByDateDesc((items || []).map(mapExpense)));
      } catch (error) {
        console.error('Failed to load expenses', error);
      }
    };

    fetchExpenses();
  }, [user]);

  const handleRemove = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete the expense?');
    if (!confirmed) return;

    if (!API_BASE_URL) {
      console.error('VITE_API_BASE_URL is not set');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/expense`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ expenseId: id }),
      });
      if (!res.ok) {
        console.error('Failed to delete expense', await res.text());
        return;
      }
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error('Failed to delete expense', error);
    }
  };

  const handleSaveExpense = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amountValue = Number(form.amount);
    if (!form.merchant.trim() || !form.date || Number.isNaN(amountValue)) return;

    let finalCategory = form.category;
    if (form.category === 'create-new') {
      if (!form.customCategory.trim()) return;
      finalCategory = form.customCategory.trim();
      setCategories((prev) => [...prev, finalCategory]);
    }

    if (!API_BASE_URL) {
      console.error('VITE_API_BASE_URL is not set');
      return;
    }

    try {
      const isEditing = Boolean(editingExpenseId);
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/expense`, {
        method: isEditing ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify({
          expenseId: editingExpenseId ?? undefined,
          merchant: form.merchant.trim(),
          category: finalCategory,
          amount: amountValue,
          date: form.date,
          status: form.status,
          ...(!isEditing && { source: 'manual' }),
        }),
      });

      if (!res.ok) {
        console.error(`Failed to ${isEditing ? 'update' : 'create'} expense`, await res.text());
        return;
      }

      const saved = await res.json();
      const nextExpense = mapExpense(saved);

      setExpenses((prev) => {
        if (isEditing) {
          return sortByDateDesc(prev.map((e) => (e.id === nextExpense.id ? nextExpense : e)));
        }
        return sortByDateDesc([nextExpense, ...prev]);
      });
      handleCloseModal();
    } catch (error) {
      console.error(`Failed to ${editingExpenseId ? 'update' : 'create'} expense`, error);
    }
  };

  const handleCloseModal = () => {
    setForm({ ...DEFAULT_FORM });
    setIsAddExpenseModalOpen(false);
    setEditingExpenseId(null);
  };

  const handleEdit = (expense: Expense) => {
    if (!categories.includes(expense.category)) {
      setCategories((prev) => [...prev, expense.category]);
    }
    setForm({
      merchant: expense.merchant,
      category: expense.category,
      amount: expense.amount.toString(),
      date: expense.date,
      status: expense.status,
      customCategory: '',
    });
    setEditingExpenseId(expense.id);
    setIsAddExpenseModalOpen(true);
  };

  return {
    expenses,
    setExpenses,
    form,
    setForm,
    categories,
    isAddExpenseModalOpen,
    setIsAddExpenseModalOpen,
    editingExpenseId,
    handleRemove,
    handleSaveExpense,
    handleCloseModal,
    handleEdit,
    getAuthHeaders,
  };
}
