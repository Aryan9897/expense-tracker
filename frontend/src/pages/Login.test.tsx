import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from './Login';
import { vi } from 'vitest';

describe('Login', () => {
    const defaultProps = {
        email: 'test@example.com',
        onEmailChange: vi.fn(),
        onPasswordSignIn: vi.fn(),
        onGoogleSignIn: vi.fn(),
        onSignup: vi.fn(),
        isSubmitting: false,
        error: null,
    };

    test('renders login form', () => {
        render(<Login {...defaultProps} />);
        expect(screen.getByRole('heading', { name: /Control your spending/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    });

    test('validates empty password', async () => {
        render(<Login {...defaultProps} />);
        const submitButton = screen.getByRole('button', { name: /Continue/i });
        fireEvent.submit(submitButton.closest('form')!);
        expect(await screen.findByText('Please enter your password.')).toBeInTheDocument();
        expect(defaultProps.onPasswordSignIn).not.toHaveBeenCalled();
    });

    test('submits form with password', async () => {
        const user = userEvent.setup();
        render(<Login {...defaultProps} />);
        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'password123');

        const submitButton = screen.getByRole('button', { name: /Continue/i });
        await user.click(submitButton);

        expect(defaultProps.onPasswordSignIn).toHaveBeenCalledWith('password123');
    });

    test('calls google sign in', async () => {
        const user = userEvent.setup();
        render(<Login {...defaultProps} />);
        const googleButton = screen.getByRole('button', { name: /Sign in with Google/i });
        await user.click(googleButton);
        expect(defaultProps.onGoogleSignIn).toHaveBeenCalled();
    });

    test('display error message', () => {
        render(<Login {...defaultProps} error="Invalid credentials" />);
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    test('calls signup', async () => {
        const user = userEvent.setup();
        render(<Login {...defaultProps} />);
        const signupLink = screen.getByText(/Click here to sign up/i);
        await user.click(signupLink);
        expect(defaultProps.onSignup).toHaveBeenCalled();
    });
});
