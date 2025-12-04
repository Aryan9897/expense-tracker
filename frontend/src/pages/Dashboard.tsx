import { StatCard } from '../components/StatCard';
import { computeTotals, sampleExpenses } from '../lib/sampleData';
import { ExpenseTotals } from '../types/expense';

type DashboardProps = {
  email: string;
  onSignOut: () => void;
};

export function Dashboard({ email, onSignOut }: DashboardProps) {
  const totals: ExpenseTotals = computeTotals(sampleExpenses);

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <p className="muted small">Dashboard</p>
          <h2>Welcome back</h2>
        </div>
        <div className="topbar-actions">
          <div className="avatar">{email.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <strong>{email}</strong>
            <span className="muted small">Personal workspace</span>
          </div>
          <button className="ghost-btn" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <section className="stats-grid">
        <StatCard title="Total spent" value={`$${totals.spent.toFixed(2)}`} accent="primary" />
        <StatCard title="Pending review" value={`$${totals.pending.toFixed(2)}`} accent="amber" />
        <StatCard title="Receipts this week" value={`${totals.receiptCount}`} accent="green" />
      </section>

      <section className="panels">
        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="muted small">Quick add</p>
              <h3>Manual expense</h3>
            </div>
            <button className="primary-btn subtle">Save</button>
          </div>
          <form className="inline-form">
            <label>
              <span>Merchant</span>
              <input placeholder="e.g., Starbucks" />
            </label>
            <label>
              <span>Category</span>
              <select defaultValue="Groceries">
                <option>Groceries</option>
                <option>Transport</option>
                <option>Dining</option>
                <option>Software</option>
              </select>
            </label>
            <label>
              <span>Amount</span>
              <input type="number" min={0} step={0.01} placeholder="0.00" />
            </label>
            <label>
              <span>Date</span>
              <input type="date" />
            </label>
          </form>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="muted small">Upload</p>
              <h3>Receipt ingestion</h3>
            </div>
            <button className="ghost-btn subtle">Upload</button>
          </div>
          <div className="dropzone">
            <p>Drop receipts here or click upload.</p>
            <p className="muted small">
              AI will extract total, date, and merchant automatically.
            </p>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="muted small">Activity</p>
            <h3>Recent expenses</h3>
          </div>
          <div className="pill neutral">Demo data</div>
        </div>
        <div className="table">
          <div className="table-head">
            <span>Merchant</span>
            <span>Category</span>
            <span>Status</span>
            <span>Source</span>
            <span>Amount</span>
            <span>Date</span>
          </div>
          {sampleExpenses.map((expense) => (
            <div className="table-row" key={expense.id}>
              <span>{expense.merchant}</span>
              <span className="muted">{expense.category}</span>
              <span>
                <span className={`pill ${expense.status === 'cleared' ? 'success' : 'neutral'}`}>
                  {expense.status === 'cleared' ? 'Cleared' : 'Pending'}
                </span>
              </span>
              <span className="muted">{expense.source === 'receipt' ? 'Receipt' : 'Manual'}</span>
              <span className="amount">${expense.amount.toFixed(2)}</span>
              <span className="muted">{expense.date}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
