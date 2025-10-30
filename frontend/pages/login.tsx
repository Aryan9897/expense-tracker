import Head from "next/head";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/router";
import { auth, googleProvider } from "@/lib/firebase";

type AuthFormState = {
  email: string;
  password: string;
};

type AuthMode = "signin" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [form, setForm] = useState<AuthFormState>({ email: "", password: "" });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [shouldRedirectToDashboard, setShouldRedirectToDashboard] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!checkingAuth && user && shouldRedirectToDashboard) {
      void router.replace("/");
    }
  }, [checkingAuth, user, shouldRedirectToDashboard, router]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus(null);

    const email = form.email.trim().toLowerCase();
    const password = form.password.trim();

    if (!email || !password) {
      setError("Email and password are both required.");
      return;
    }

    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
        setStatus("Account created! Redirecting to your expenses…");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setStatus("Signed in successfully. Redirecting…");
      }
      setForm({ email: "", password: "" });
      setShouldRedirectToDashboard(true);
    } catch (unknownError) {
      const message = resolveFirebaseError(unknownError);
      setError(message);
      setShouldRedirectToDashboard(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setStatus(null);
    try {
      await signInWithPopup(auth, googleProvider);
      setStatus("Signed in with Google. Redirecting…");
      setShouldRedirectToDashboard(true);
    } catch (unknownError) {
      const message = resolveFirebaseError(unknownError);
      setError(message);
      setShouldRedirectToDashboard(false);
    }
  };

  const handleResetPassword = async () => {
    const email = form.email.trim().toLowerCase();
    if (!email) {
      setError("Enter your email above first, then request a reset link.");
      return;
    }

    setError(null);
    setStatus(null);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (!methods.includes("password")) {
        setError("No password-based account found for that email.");
        return;
      }
      await sendPasswordResetEmail(auth, email);
      setStatus("Password reset link sent. Check your inbox.");
    } catch (unknownError) {
      const message = resolveFirebaseError(unknownError);
      setError(message);
    }
  };

  const resolveFirebaseError = (errorInput: unknown): string => {
    if (errorInput instanceof FirebaseError) {
      switch (errorInput.code) {
        case "auth/email-already-in-use":
          return "An account already exists with that email.";
        case "auth/invalid-login-credentials":
          return "Incorrect email or password.";
        case "auth/wrong-password":
          return "Incorrect password. Try again or reset it.";
        case "auth/user-not-found":
          return "No account found with that email.";
        case "auth/popup-closed-by-user":
          return "Google sign-in was cancelled.";
        case "auth/credential-already-in-use":
          return "That Google account is already linked to another user.";
        default:
          return errorInput.message ?? "Something went wrong with Firebase auth.";
      }
    }
    return "Unexpected error. Try again.";
  };

  return (
    <>
      <Head>
        <title>Sign in | Expense Tracker</title>
        <meta
          name="description"
          content="Authenticate with email/password or link your Google account for the Expense Tracker MVP."
        />
      </Head>
      <main className="page page--auth">
        <section className="panel panel--auth">
          <div className="panel__header panel__header--stacked">
            <h1 className="panel__title">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="panel__subtitle">
              {mode === "signup"
                ? "Start tracking expenses securely with Firebase Auth."
                : "Sign in to view and manage your expenses."}
            </p>
          </div>
          {checkingAuth ? (
            <p className="panel__empty">Checking your session…</p>
          ) : user && shouldRedirectToDashboard ? (
            <p className="panel__empty">Signing you in…</p>
          ) : user ? (
            null
          ) : (
            <>
              <form className="form" onSubmit={handleSubmit} noValidate>
                <div className="form__field">
                  <label className="form__label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    className="form__input"
                    required
                  />
                </div>
                <div className="form__field">
                  <label className="form__label" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={form.password}
                    onChange={handleChange}
                    className="form__input"
                    required
                  />
                </div>
                <button type="submit" className="button button--full">
                  {mode === "signup" ? "Create account" : "Sign in"}
                </button>
                <button type="button" className="button button--link" onClick={handleResetPassword}>
                  Forgot password?
                </button>
              </form>

              <div className="divider">
                <span>OR</span>
              </div>

              <button type="button" className="button button--full" onClick={handleGoogleSignIn}>
                Continue with Google
              </button>

              <p className="panel__swap">
                {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
                <button
                  type="button"
                  className="button button--link"
                  onClick={() => setMode((current) => (current === "signup" ? "signin" : "signup"))}
                >
                  {mode === "signup" ? "Sign in" : "Create one"}
                </button>
              </p>

              {status ? <p className="form__success">{status}</p> : null}
              {error ? (
                <p role="alert" className="form__error">
                  {error}
                </p>
              ) : null}
            </>
          )}
        </section>
      </main>
    </>
  );
}
