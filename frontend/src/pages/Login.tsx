import { FormEvent, useEffect, useRef, useState } from 'react';
import styles from './Login.module.css';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

type LoginProps = {
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
};

export function Login({ email, onEmailChange, onSubmit }: LoginProps) {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const [googleReady, setGoogleReady] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return;

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    ) as HTMLScriptElement | null;

    const renderGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({ client_id: googleClientId });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill'
      });
      setGoogleReady(true);
    };

    if (existingScript) {
      existingScript.addEventListener('load', renderGoogleButton, { once: true });
      if (window.google) renderGoogleButton();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.head.appendChild(script);
  }, [googleClientId]);

  return (
    <div className={styles.loginPage}>
      <div className={styles.hero}>
        <div className={styles.heroBadge}>Smart Expense Tracker</div>
        <h1 className={styles.heroTitle}>
          Control your spending.
          <br />
          Capture every receipt.
        </h1>
        <p className={`muted ${styles.heroCopy}`}>
          Upload receipts, add expenses manually, and let AI handle extraction with Textract + OpenAI.
        </p>
        <div className={styles.heroGrid}>
          <div className={styles.heroTile}>
            <div className={styles.heroIcon}>📄</div>
            <div>
              <strong>Receipt OCR</strong>
              <p className="muted small">Auto-extract totals, dates, and merchants.</p>
            </div>
          </div>
          <div className={styles.heroTile}>
            <div className={styles.heroIcon}>📊</div>
            <div>
              <strong>Clean insights</strong>
              <p className="muted small">Stay on top of categories and weekly spend.</p>
            </div>
          </div>
          <div className={styles.heroTile}>
            <div className={styles.heroIcon}>🔒</div>
            <div>
              <strong>Secure by design</strong>
              <p className="muted small">Firebase Auth keeps your data private.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <p className="muted small">Welcome back</p>
          <h2>Sign in to continue</h2>
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
            <input type="password" required placeholder="••••••••" />
          </label>

          <button className="primary-btn" type="submit">
            Continue
          </button>
          <div ref={googleButtonRef} className={styles.googleBtnContainer}>
            {!googleReady && (
              <button className="gsi-material-button" type="button">
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
                  <span className="gsi-material-button-contents">Sign in with Google</span>
                  <span className={styles.srOnly}>Sign in with Google</span>
                </div>
              </button>
            )}
          </div>
        </form>
        <p className="footnote">Protected by Firebase Auth. We never share your data.</p>
      </div>
    </div>
  );
}
