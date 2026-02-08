import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Signup } from './Signup';
import { vi } from 'vitest';

describe('Signup', () => {
    const initialData = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    };

    const defaultProps = {
        initial: initialData,
        onSubmit: vi.fn(),
        onCancel: vi.fn(),
        isSubmitting: false,
        error: null,
    };

    test('renders signup form', () => {
        render(<Signup {...defaultProps} />);
        expect(screen.getByRole('heading', { name: /Start tracking your expenses/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/First name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Re-enter password/i)).toBeInTheDocument();
    });

    test('validates required fields', async () => {
        render(<Signup {...defaultProps} />);
        fireEvent.submit(screen.getByRole('button', { name: /Sign up/i }));
        expect(await screen.findByText('Please complete all required fields.')).toBeInTheDocument();
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    test('validates password mismatch', async () => {
        const user = userEvent.setup();
        render(<Signup {...defaultProps} />);

        await user.type(screen.getByLabelText(/First name/i), 'John');
        await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/^Password/i), 'password123');
        await user.type(screen.getByLabelText(/Re-enter password/i), 'password456');

        await user.click(screen.getByRole('button', { name: /Sign up/i }));

        expect(await screen.findByText('Passwords must match.')).toBeInTheDocument();
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    test('submits form successfully', async () => {
        const user = userEvent.setup();
        render(<Signup {...defaultProps} />);
        await user.type(screen.getByLabelText(/First name/i), 'John');
        await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/^Password/i), 'password123');
        await user.type(screen.getByLabelText(/Re-enter password/i), 'password123');

        await user.click(screen.getByRole('button', { name: /Sign up/i }));

        expect(defaultProps.onSubmit).toHaveBeenCalledWith(expect.objectContaining({
            firstName: 'John',
            email: 'john@example.com',
            password: 'password123'
        }));
    });

    test('calls cancel', async () => {
        const user = userEvent.setup();
        render(<Signup {...defaultProps} />);
        await user.click(screen.getByRole('button', { name: /Back/i }));
        expect(defaultProps.onCancel).toHaveBeenCalled();
    });
});
