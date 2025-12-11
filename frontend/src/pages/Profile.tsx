import { FormEvent, useEffect, useState } from 'react';
import styles from './Profile.module.css';

type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  bio: string;
};

type ProfileProps = {
  profile: ProfileData;
  onSave: (data: ProfileData) => void;
  onCancel: () => void;
  onChangePassword?: (oldPassword: string, newPassword: string, confirmPassword: string) => void;
};

export function Profile({ profile, onSave, onCancel, onChangePassword }: ProfileProps) {
  const [form, setForm] = useState(profile);
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => setForm(profile), [profile]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.email.trim()) return;

    const wantsPasswordChange =
      passwords.oldPassword.trim() || passwords.newPassword.trim() || passwords.confirmPassword;

    if (wantsPasswordChange) {
      if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword) return;
      if (passwords.newPassword !== passwords.confirmPassword) return;
    }

    onSave({ ...form, email: form.email.trim() });
    if (wantsPasswordChange && onChangePassword) {
      onChangePassword(passwords.oldPassword, passwords.newPassword, passwords.confirmPassword);
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className="muted small">Account</p>
          <h2>Your profile</h2>
        </div>
        <div className={styles.actions}>
          <button className="ghost-btn" type="button" onClick={onCancel}>
            Back
          </button>
          <button className="primary-btn" type="submit" form="profile-form">
            Save changes
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <p className="muted small">Profile</p>
            <h3>Edit your info</h3>
          </div>
        </div>

        <form id="profile-form" className={styles.form} onSubmit={handleSubmit}>
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
              rows={4}
              value={form.bio}
              onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Anything your teammates should know about how to reach you."
            />
            <p className={styles.helper}>Optional context like contact preference or team.</p>
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="oldPassword">
                Old password
                <span className={styles.required} aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="oldPassword"
                type="password"
                value={passwords.oldPassword}
                onChange={(e) => setPasswords((prev) => ({ ...prev, oldPassword: e.target.value }))}
                placeholder="Current password"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="newPassword">
                New password
                <span className={styles.required} aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="newPassword"
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
                placeholder="New password"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="confirmPassword">
                Re-enter new password
                <span className={styles.required} aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                placeholder="Confirm new password"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
