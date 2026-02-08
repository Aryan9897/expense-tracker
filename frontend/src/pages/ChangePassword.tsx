import { FormEvent, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './ChangePassword.module.css';

type ChangePasswordProps = {
    onCancel: () => void;
    onSuccess: () => void;
};

export function ChangePassword({ onCancel, onSuccess }: ChangePasswordProps) {
    const { changePassword } = useAuth();
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        if (passwords.newPassword.length < 6) {
            setError('Password should be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            await changePassword(passwords.oldPassword, passwords.newPassword);
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            onSuccess();
        } catch (err: any) {
            console.error('Failed to change password', err);
            // Firebase error codes could be checked here for better messages
            if (err.code === 'auth/wrong-password') {
                setError('Incorrect old password.');
            } else {
                setError('Failed to update password. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.cardHead}>
                    <div>
                        <p className="muted small">Account Security</p>
                        <h3>Update your password</h3>
                        <p className={styles.subtext}>Ensure your account is using a strong, secure password.</p>
                    </div>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form id="change-password-form" className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label htmlFor="oldPassword">
                            Old password
                            <span className={styles.required} aria-hidden="true">*</span>
                        </label>
                        <input
                            id="oldPassword"
                            type="password"
                            required
                            value={passwords.oldPassword}
                            onChange={(e) => setPasswords((prev) => ({ ...prev, oldPassword: e.target.value }))}
                            placeholder="Current password"
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="newPassword">
                            New password
                            <span className={styles.required} aria-hidden="true">*</span>
                        </label>
                        <input
                            id="newPassword"
                            type="password"
                            required
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
                            placeholder="New password"
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="confirmPassword">
                            Re-enter new password
                            <span className={styles.required} aria-hidden="true">*</span>
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            required
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="Confirm new password"
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button className="ghost-btn" type="button" onClick={onCancel} disabled={loading}>
                            Cancel
                        </button>
                        <button className="primary-btn" type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
