import { useEffect, useRef, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';
import { ChatWidget } from '../components/ChatWidget';
import { Expense, ExpenseTotals } from '../types/expense';
import { useAuth } from '../contexts/AuthContext';
import { useExpenses } from '../hooks/useExpenses';
import { useReceiptUpload } from '../hooks/useReceiptUpload';
import styles from './Dashboard.module.css';

const computeTotals = (expenses: Expense[]): ExpenseTotals => {
  const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pending = expenses
    .filter((e) => e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);
  const receiptCount = expenses.filter((e) => e.source === 'receipt').length;
  return { spent, pending, receiptCount };
};

type DashboardProps = {
  onSignOut: () => void;
  onOpenProfile: () => void;
};

export function Dashboard({ onSignOut, onOpenProfile }: DashboardProps) {
  const { user } = useAuth();
  const email = user?.email || '';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const {
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
  } = useExpenses();

  const {
    fileInputRef,
    uploadStatus,
    processingReceipt,
    processingTimedOut,
    handleFileSelect,
  } = useReceiptUpload(expenses, setExpenses, getAuthHeaders);

  const totals: ExpenseTotals = computeTotals(expenses);

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
        <StatCard
          title="Total spent"
          value={`$${totals.spent.toFixed(2)}`}
          accent="primary"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <StatCard
          title="Pending review"
          value={`$${totals.pending.toFixed(2)}`}
          accent="amber"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
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
              disabled={uploadStatus === 'uploading' || processingReceipt}
            >
              {uploadStatus === 'uploading' ? 'Uploading…' : processingReceipt ? 'Processing…' : 'Upload receipt'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className={styles.hiddenInput}
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              aria-hidden="true"
            />
            {uploadStatus === 'error' && (
              <p className="muted small" style={{ marginTop: '8px', color: 'var(--color-danger, #e53e3e)' }}>
                Upload failed. Please try again.
              </p>
            )}
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
          {processingReceipt && (
            <div className={styles.skeletonRow}>
              <span><span className={styles.spinner} />Processing receipt…</span>
              <span>—</span>
              <span>—</span>
              <span>Receipt</span>
              <span>—</span>
              <span>—</span>
              <span />
            </div>
          )}
          {processingTimedOut && (
            <div className={`${styles.skeletonRow} ${styles.skeletonError}`}>
              <span>Receipt couldn't be parsed. Please add the expense manually.</span>
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          )}
          {expenses.length === 0 && !processingReceipt && !processingTimedOut && (
            <div className={styles.emptyState}>
              <p className="muted">No activity, get started by adding your expenses</p>
            </div>
          )}
          {expenses.map((expense) => (
            <div className={styles.tableRow} key={expense.id}>
              <span>{expense.merchant}</span>
              <span className="muted">{expense.category}</span>
              <span>
                <span className={`${styles.pill} ${expense.status === 'cleared' ? styles.success : styles.neutral}`}>
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 6h18" />
                    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M5 6l1 14a1 1 0 0 0 1 .9h10a1 1 0 0 0 1-.9L19 6" />
                  </svg>
                </button>
              </span>
            </div>
          ))}
        </div>
      </section>

      <Modal
        isOpen={isAddExpenseModalOpen}
        onClose={handleCloseModal}
        title={editingExpenseId ? 'Edit Expense' : 'Add Expense'}
      >
        <form onSubmit={handleSaveExpense} className={styles.modalForm}>
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
            <button type="button" className="ghost-btn" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              {editingExpenseId ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>

      <ChatWidget expenses={expenses} />
    </div>
  );
}
