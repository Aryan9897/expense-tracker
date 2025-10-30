import Head from "next/head";
import Link from "next/link";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebase";
import type { Expense } from "@shared/types";

type ExpenseFormState = {
  amount: string;
  note: string;
};

export default function HomePage() {
  // Track what the user is typing before it becomes an Expense.
  const [form, setForm] = useState<ExpenseFormState>({ amount: "", note: "" });
  // Keep expenses in memory for now; backend wiring comes later.
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      void router.replace("/login");
    }
  }, [authLoading, user, router]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = Number(form.amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Amount must be a positive number.");
      return;
    }

    if (!user) {
      setError("You must be signed in to create an expense.");
      return;
    }

    const timestamp = new Date();
    const trimmedNote = form.note.trim();
    const expense: Expense = {
      userId: user.uid,
      sk: `expense#${timestamp.toISOString()}`,
      amount: parsedAmount,
      note: trimmedNote ? trimmedNote : undefined,
      source: "manual",
    };

    setExpenses((current) => [expense, ...current]);
    setForm({ amount: "", note: "" });
    setError(null);
  };

  const total = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  );

  return (
    <>
      <Head>
        <title>Expense Tracker MVP</title>
        <meta
          name="description"
          content="Expense Tracker MVP with Firebase Authentication and client-side expense capture."
        />
      </Head>
      <main className="page">
        <section className="panel">
          <div className="panel__header">
            <h1 className="panel__title">Expense Tracker</h1>
            {user ? (
              <button
                type="button"
                className="button button--secondary"
                onClick={() => signOut(auth)}
              >
                Sign out
              </button>
            ) : null}
          </div>
          {authLoading ? (
            <p className="panel__empty">Checking your session…</p>
          ) : user ? (
            <form className="form" onSubmit={handleSubmit} noValidate>
              <div className="form__field">
                <label className="form__label" htmlFor="amount">
                  Amount (USD)
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={handleChange}
                  className="form__input"
                  required
                />
              </div>
              <div className="form__field">
                <label className="form__label" htmlFor="note">
                  Note
                </label>
                <textarea
                  id="note"
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  className="form__textarea"
                  rows={3}
                  placeholder="What did you spend on?"
                />
              </div>
              <button type="submit" className="button">
                Save to list
              </button>
              {error ? (
                <p role="alert" className="form__error">
                  {error}
                </p>
              ) : null}
            </form>
          ) : (
            <>
              <p className="panel__empty">
                Sign in to add expenses. Your entries stay tied to your Firebase account.
              </p>
              <Link href="/login" className="button">
                Go to login
              </Link>
              {error ? (
                <p role="alert" className="form__error">
                  {error}
                </p>
              ) : null}
            </>
          )}
        </section>

        <section className="panel">
          <div className="panel__header">
            <h2 className="panel__title">Recent Expenses</h2>
            <span className="panel__total">
              Total: <strong>${total.toFixed(2)}</strong>
            </span>
          </div>
          {expenses.length === 0 ? (
            <p className="panel__empty">
              {user
                ? "You have no expenses yet. Add one above to see it here."
                : "Once you sign in and add expenses, they will appear here."}
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">When</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => {
                    const createdAtIso = expense.sk.replace("expense#", "");
                    const createdAt = Number.isNaN(Date.parse(createdAtIso))
                      ? createdAtIso
                      : new Date(createdAtIso).toLocaleString();

                    return (
                      <tr key={expense.sk}>
                        <td>{createdAt}</td>
                        <td>${expense.amount.toFixed(2)}</td>
                        <td>{expense.note ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
