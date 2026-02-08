import { FormEvent, useEffect, useState } from 'react';
import styles from './Profile.module.css';

type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type ProfileProps = {
  profile: ProfileData;
  onSave: (data: ProfileData) => void;
  onCancel: () => void;
  onChangePassword: () => void;
  isSaving?: boolean;
  isGoogleUser?: boolean;
};

export function Profile({ profile, onSave, onCancel, onChangePassword, isSaving, isGoogleUser }: ProfileProps) {
  const [form, setForm] = useState(profile);

  useEffect(() => setForm(profile), [profile]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.email.trim()) return;

    onSave({ ...form, email: form.email.trim() });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <p className="muted small">Profile</p>
            <h3>Edit your info</h3>
            <p className={styles.subtext}>Keep your contact details up to date.</p>
          </div>
        </div>

        <form id="profile-form" className={styles.form} onSubmit={handleSubmit}>
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
              readOnly
              disabled
              title="Email cannot be changed"
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

          <div className={styles.actions}>
            <button className="ghost-btn" type="button" onClick={onCancel}>
              Back
            </button>
            {!isGoogleUser && (
              <button className="ghost-btn" type="button" onClick={onChangePassword}>
                Change password
              </button>
            )}
            <button className="primary-btn" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
