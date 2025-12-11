import { FormEvent, useState } from 'react';
import styles from './Signup.module.css';

type SignupData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  bio: string;
  password: string;
  confirmPassword: string;
};

type SignupProps = {
  initial: SignupData;
  onSubmit: (data: SignupData) => void;
  onCancel: () => void;
};

export function Signup({ initial, onSubmit, onCancel }: SignupProps) {
  const [form, setForm] = useState(initial);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.firstName.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      return;
    }
    onSubmit({
      ...form,
      firstName: form.firstName.trim(),
      email: form.email.trim()
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <p className="muted small">Create account</p>
            <h2>Join AI Expense Tracker</h2>
          </div>
          <div className={styles.actions}>
            <button className="ghost-btn" type="button" onClick={onCancel}>
              Back
            </button>
            <button className="primary-btn" type="submit" form="signup-form">
              Sign up
            </button>
          </div>
        </div>

        <form id="signup-form" className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="firstName">
                First name
                <span className={styles.required} aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="firstName"
                required
                value={form.firstName}
                onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                placeholder="Jordan"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                value={form.lastName}
                onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                placeholder="Lee"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="email">
                Email
                <span className={styles.required} aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="you@example.com"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="jobTitle">Job title</label>
              <input
                id="jobTitle"
                value={form.jobTitle}
                onChange={(e) => setForm((prev) => ({ ...prev, jobTitle: e.target.value }))}
                placeholder="Finance Manager"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="company">Company</label>
              <input
                id="company"
                value={form.company}
                onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
                placeholder="Acme Inc."
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="bio">Notes</label>
            <textarea
              id="bio"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Optional context like contact preference or team."
            />
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="password">
                Password
                <span className={styles.required} aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="password"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="confirmPassword">
                Re-enter password
                <span className={styles.required} aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                placeholder="••••••••"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
