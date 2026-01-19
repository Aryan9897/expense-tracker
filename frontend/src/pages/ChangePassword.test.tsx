import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangePassword } from './ChangePassword';
import { vi } from 'vitest';
import * as AuthContext from '../contexts/AuthContext';

// Mock the AuthContext
vi.mock('../contexts/AuthContext', () => ({
    useAuth: vi.fn(),
}));

describe('ChangePassword', () => {
    const mockChangePassword = vi.fn();
    const mockOnCancel = vi.fn();
    const mockOnSuccess = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
        (AuthContext.useAuth as any).mockReturnValue({
            changePassword: mockChangePassword
        });
    });

    test('renders change password form', () => {
        render(<ChangePassword onCancel={mockOnCancel} onSuccess={mockOnSuccess} />);
        expect(screen.getByRole('heading', { name: /Change Password/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/^Old password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^New password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Re-enter new password/i)).toBeInTheDocument();
    });

    test('validates password mismatch', () => {
        render(<ChangePassword onCancel={mockOnCancel} onSuccess={mockOnSuccess} />);

        fireEvent.change(screen.getByLabelText(/^Old password/i), { target: { value: 'oldPass' } });
        fireEvent.change(screen.getByLabelText(/^New password/i), { target: { value: 'newPass123' } });
        fireEvent.change(screen.getByLabelText(/Re-enter new password/i), { target: { value: 'mismatch' } });

        fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

        expect(screen.getByText('New passwords do not match.')).toBeInTheDocument();
        expect(mockChangePassword).not.toHaveBeenCalled();
    });

    test('validates short password', () => {
        render(<ChangePassword onCancel={mockOnCancel} onSuccess={mockOnSuccess} />);

        fireEvent.change(screen.getByLabelText(/^Old password/i), { target: { value: 'oldPass' } });
        fireEvent.change(screen.getByLabelText(/^New password/i), { target: { value: '123' } });
        fireEvent.change(screen.getByLabelText(/Re-enter new password/i), { target: { value: '123' } });

        fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

        expect(screen.getByText('Password should be at least 6 characters.')).toBeInTheDocument();
        expect(mockChangePassword).not.toHaveBeenCalled();
    });

    test('submits successfully', async () => {
        mockChangePassword.mockResolvedValue(undefined);
        render(<ChangePassword onCancel={mockOnCancel} onSuccess={mockOnSuccess} />);

        fireEvent.change(screen.getByLabelText(/^Old password/i), { target: { value: 'oldPass' } });
        fireEvent.change(screen.getByLabelText(/^New password/i), { target: { value: 'newPass123' } });
        fireEvent.change(screen.getByLabelText(/Re-enter new password/i), { target: { value: 'newPass123' } });

        fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

        await waitFor(() => {
            expect(mockChangePassword).toHaveBeenCalledWith('oldPass', 'newPass123');
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });

    test('handles wrong old password error', async () => {
        const error = { code: 'auth/wrong-password' };
        mockChangePassword.mockRejectedValue(error);
        render(<ChangePassword onCancel={mockOnCancel} onSuccess={mockOnSuccess} />);

        fireEvent.change(screen.getByLabelText(/^Old password/i), { target: { value: 'wrongPass' } });
        fireEvent.change(screen.getByLabelText(/^New password/i), { target: { value: 'newPass123' } });
        fireEvent.change(screen.getByLabelText(/Re-enter new password/i), { target: { value: 'newPass123' } });

        fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

        await waitFor(() => {
            expect(screen.getByText('Incorrect old password.')).toBeInTheDocument();
            expect(mockOnSuccess).not.toHaveBeenCalled();
        });
    });

    test('calls cancel', () => {
        render(<ChangePassword onCancel={mockOnCancel} onSuccess={mockOnSuccess} />);
        fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
        expect(mockOnCancel).toHaveBeenCalled();
    });
});
