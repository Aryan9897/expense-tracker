import { FormEvent } from 'react';

type LoginProps = {
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
};

export function Login({ email, onEmailChange, onSubmit }: LoginProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="login-grid">
      <div className="login-panel">
        <div className="badge">Smart Expense Tracker</div>
        <h1>
          Spend smarter.
          <br />
          Track effortlessly.
        </h1>
        <p className="muted">
          Sign in to manage expenses, capture receipts, and let AI keep everything organized for you.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" required placeholder="••••••••" />
          </label>

          <button className="primary-btn" type="submit">
            Continue
          </button>
          <button className="ghost-btn" type="button">
            Continue with Google
          </button>
        </form>

        <p className="footnote">Protected by Firebase Auth. We never share your data.</p>
      </div>

      <div className="login-hero">
        <div className="glass-card">
          <p className="muted">Receipt captured</p>
          <h3>$42.80 • Trader Joe&apos;s</h3>
          <p className="pill success">Auto-categorized • Groceries</p>
        </div>
        <div className="glass-card alt">
          <p className="muted">Weekly summary</p>
          <h3>$268.40 spent</h3>
          <div className="progress">
            <span style={{ width: '62%' }} />
          </div>
          <p className="muted small">62% of your weekly budget</p>
        </div>
      </div>
    </div>
  );
}
