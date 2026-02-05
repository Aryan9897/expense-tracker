import { FormEvent, useEffect, useRef, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';
import { computeTotals } from '../lib/sampleData';
import { Expense, ExpenseTotals } from '../types/expense';
import styles from './Dashboard.module.css';

const sortByDateDesc = (list: Expense[]) =>
  [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type DashboardProps = {
  email: string;
  onSignOut: () => void;
  onOpenProfile: () => void;
};

export function Dashboard({ email, onSignOut, onOpenProfile }: DashboardProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({
    merchant: '',
    category: 'Groceries',
    amount: '',
    date: '',
    status: 'pending',
    customCategory: ''
  });
  const [categories, setCategories] = useState(['Groceries', 'Transport', 'Software', 'Coffee']);
  const totals: ExpenseTotals = computeTotals(expenses);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const userId = email;

  const handleRemove = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete the expense?');
    if (!confirmed) return;

    if (!API_BASE_URL) {
      console.error('VITE_API_BASE_URL is not set');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/expense`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, expenseId: id })
      });

      if (!res.ok) {
        console.error('Failed to delete expense', await res.text());
        return;
      }

      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    } catch (error) {
      console.error('Failed to delete expense', error);
    }
  };

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
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
      const res = await fetch(`${API_BASE_URL}/expense`, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          expenseId: editingExpenseId ?? undefined,
          merchant: form.merchant.trim(),
          category: finalCategory,
          amount: amountValue,
          date: form.date,
          status: form.status,
          source: 'manual'
        })
      });

      if (!res.ok) {
        console.error(`Failed to ${isEditing ? 'update' : 'create'} expense`, await res.text());
        return;
      }

      const saved = await res.json();
      const nextExpense: Expense = {
        id: saved.expenseId ?? saved.id,
        merchant: saved.merchant,
        category: saved.category,
        amount: saved.amount,
        date: saved.date,
        status: saved.status,
        source: saved.source
      };

      setExpenses((prev) => {
        if (isEditing) {
          const updated = prev.map((expense) => (expense.id === nextExpense.id ? nextExpense : expense));
          return sortByDateDesc(updated);
        }
        return sortByDateDesc([nextExpense, ...prev]);
      });
      handleCloseModal();
    } catch (error) {
      console.error(`Failed to ${editingExpenseId ? 'update' : 'create'} expense`, error);
    }
  };

  const handleCloseModal = () => {
    setForm({ merchant: '', category: 'Groceries', amount: '', date: '', status: 'pending', customCategory: '' });
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
      customCategory: ''
    });
    setEditingExpenseId(expense.id);
    setIsAddExpenseModalOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file);
      // For now just simulate adding an expense from receipt
      const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        merchant: 'Receipt Upload',
        category: 'Uncategorized',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        source: 'receipt'
      };
      setExpenses((prev) => sortByDateDesc([newExpense, ...prev]));
    }
  };

  useEffect(() => {
    if (!API_BASE_URL || !userId) return;

    const fetchExpenses = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/expenses?userId=${encodeURIComponent(userId)}`);
        if (!res.ok) {
          console.error('Failed to load expenses', await res.text());
          return;
        }
        const items = await res.json();
        const mapped: Expense[] = (items || []).map((item: any) => ({
          id: item.expenseId ?? item.id,
          merchant: item.merchant,
          category: item.category,
          amount: item.amount,
          date: item.date,
          status: item.status,
          source: item.source
        }));
        setExpenses(sortByDateDesc(mapped));
      } catch (error) {
        console.error('Failed to load expenses', error);
      }
    };

    fetchExpenses();
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div>
          <p className="muted small">Dashboard</p>
          <h2>Welcome back</h2>
        </div>
        <div className={styles.topbarActions}>
          <div className={styles.userMenuWrap} ref={menuRef}>
            <button
              type="button"
              className={styles.avatarButton}
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-label="Open profile menu"
            >
              {email.charAt(0).toUpperCase()}
            </button>
            {menuOpen && (
              <div className={styles.userMenu} role="menu">
                <button
                  type="button"
                  className={styles.menuItem}
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenProfile();
                  }}
                >
                  Profile
                </button>
                <button
                  type="button"
                  className={styles.menuItem}
                  role="menuitem"
                  onClick={onSignOut}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className={styles.statsGrid}>
        <StatCard title="Total spent" value={`$${totals.spent.toFixed(2)}`} accent="primary" />
        <StatCard title="Pending review" value={`$${totals.pending.toFixed(2)}`} accent="amber" />
      </section>



      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <p className="muted small">Activity</p>
            <h3>Recent expenses</h3>
          </div>
          <div className={styles.headerActions}>
            <button
              className="primary-btn small"
              onClick={() => setIsAddExpenseModalOpen(true)}
            >
              Add expense
            </button>
            <button
              className="ghost-btn small"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload receipt
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className={styles.hiddenInput}
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              aria-hidden="true"
            />
          </div>
        </div>
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Merchant</span>
            <span>Category</span>
            <span>Status</span>
            <span>Source</span>
            <span>Amount</span>
            <span>Date</span>
            <span aria-hidden="true" />
          </div>
          {expenses.length === 0 ? (
            <div className={styles.emptyState}>
              <p className="muted">No activity, get started by adding your expenses</p>
            </div>
          ) : (
            expenses.map((expense) => (
              <div className={styles.tableRow} key={expense.id}>
                <span>{expense.merchant}</span>
                <span className="muted">{expense.category}</span>
                <span>
                  <span
                    className={`${styles.pill} ${expense.status === 'cleared' ? styles.success : styles.neutral
                      }`}
                  >
                    {expense.status === 'cleared' ? 'Cleared' : 'Pending'}
                  </span>
                </span>
                <span className="muted">{expense.source === 'receipt' ? 'Receipt' : 'Manual'}</span>
                <span className={styles.amount}>${expense.amount.toFixed(2)}</span>
                <span className="muted">{expense.date}</span>
                <span className={styles.actionCell}>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => handleEdit(expense)}
                    aria-label="Edit expense"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleRemove(expense.id)}
                    aria-label="Remove expense"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M5 6l1 14a1 1 0 0 0 1 .9h10a1 1 0 0 0 1-.9L19 6" />
                    </svg>
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <Modal
        isOpen={isAddExpenseModalOpen}
        onClose={handleCloseModal}
        title={editingExpenseId ? 'Edit Expense' : 'Add Expense'}
      >
        <form onSubmit={handleAdd} className={styles.modalForm}>
          <label>
            <span>Merchant</span>
            <input
              placeholder="e.g., Starbucks"
              value={form.merchant}
              onChange={(e) => setForm((prev) => ({ ...prev, merchant: e.target.value }))}
              required
              autoFocus
            />
          </label>
          <label>
            <span>Category</span>
            <select
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="create-new">Create new...</option>
            </select>
          </label>
          {form.category === 'create-new' && (
            <label>
              <span>New Category Name</span>
              <input
                placeholder="e.g., Gym"
                value={form.customCategory}
                onChange={(e) => setForm((prev) => ({ ...prev, customCategory: e.target.value }))}
                required
                autoFocus
              />
            </label>
          )}
          <label>
            <span>Status</span>
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="pending">Pending</option>
              <option value="cleared">Cleared</option>
            </select>
          </label>
          <label>
            <span>Amount</span>
            <input
              type="number"
              min={0}
              step={0.01}
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
              required
            />
          </label>
          <label>
            <span>Date</span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              required
            />
          </label>
          <div className={styles.modalActions}>
            <button
              type="button"
              className="ghost-btn"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              {editingExpenseId ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
