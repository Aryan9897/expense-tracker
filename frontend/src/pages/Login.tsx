import { FormEvent, useEffect, useRef, useState } from 'react';
import styles from './Login.module.css';
import googleLogo from '../assets/google-logo.svg';

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
                    <img src={googleLogo} alt="" />
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
