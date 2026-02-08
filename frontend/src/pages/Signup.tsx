import { FormEvent, useState } from 'react';
import styles from './Signup.module.css';

type SignupData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type SignupProps = {
  initial: SignupData;
  onSubmit: (data: SignupData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: string | null;
};

export function Signup({ initial, onSubmit, onCancel, isSubmitting, error }: SignupProps) {
  const [form, setForm] = useState(initial);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    if (!form.firstName.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      setLocalError('Please complete all required fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setLocalError('Passwords must match.');
      return;
    }
    await onSubmit({
      ...form,
      firstName: form.firstName.trim(),
      email: form.email.trim()
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <p className={styles.eyebrow}>Create account</p>
          <h2>Start tracking your expenses</h2>
          <p className={styles.subtext}>Set up a personal workspace in a few minutes.</p>
        </div>

        <form id="signup-form" className={styles.form} onSubmit={handleSubmit}>
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

          {(error || localError) && (
            <p className="error" role="alert">
              {localError || error}
            </p>
          )}

          <div className={styles.actions}>
            <button className="ghost-btn" type="button" onClick={onCancel}>
              Back
            </button>
            <button className="primary-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
