import { FormEvent, useState } from 'react';
import styles from './Login.module.css';

type LoginProps = {
  email: string;
  onEmailChange: (value: string) => void;
  onPasswordSignIn: (password: string) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  onSignup: () => void;
  isSubmitting?: boolean;
  error?: string | null;
};

export function Login({
  email,
  onEmailChange,
  onPasswordSignIn,
  onGoogleSignIn,
  onSignup,
  isSubmitting,
  error
}: LoginProps) {
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }
    await onPasswordSignIn(password);
  };

  const handleGoogleClick = async () => {
    setLocalError(null);
    await onGoogleSignIn();
  };

  return (
    <div className={styles.page}>
      <main className={styles.simpleLayout}>
        <section className={styles.intro}>
          <div className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true" />
            <p className={styles.brandName}>Smart Expense Tracker</p>
          </div>
          <h1 className={styles.title}>A calm, personal space for your expenses.</h1>
          <p className={styles.subtitle}>
            Snap receipts, track spending, and stay in control without overthinking your finances.
          </p>
          <div className={styles.featureRow}>
            <div>
              <p className={styles.featureLabel}>Receipt capture</p>
              <p className={styles.featureValue}>Auto-extract totals</p>
            </div>
            <div>
              <p className={styles.featureLabel}>Daily clarity</p>
              <p className={styles.featureValue}>See where money goes</p>
            </div>
            <div>
              <p className={styles.featureLabel}>Private by default</p>
              <p className={styles.featureValue}>Your data stays yours</p>
            </div>
          </div>
        </section>

        <section className={styles.formCard}>
          <div className={styles.formHeader}>
            <p className={styles.eyebrow}>Welcome back</p>
            <h2>Sign in</h2>
            <p className={styles.formSubtext}>Use your email and password, or continue with Google.</p>
          </div>

          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Email</span>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Password</span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {(error || localError) && (
              <p className="error" role="alert">
                {localError || error}
              </p>
            )}

            <button className={`primary-btn ${styles.primaryBtn}`} type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Continue'}
            </button>

            <div className={styles.divider}>Or continue with</div>

            <div className={styles.googleBtnContainer}>
              <button
                className="gsi-material-button"
                type="button"
                onClick={handleGoogleClick}
                disabled={isSubmitting}
              >
                <div className="gsi-material-button-state" aria-hidden="true" />
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon" aria-hidden="true">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      style={{ display: 'block' }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                      <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isSubmitting ? 'Connecting…' : 'Sign in with Google'}
                  </span>
                  <span className={styles.srOnly}>Sign in with Google</span>
                </div>
              </button>
            </div>
          </form>

          <div className={styles.formFooter}>
            <span>New here?</span>
            <button className={styles.linkBtn} type="button" onClick={onSignup}>
              Create an account
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
