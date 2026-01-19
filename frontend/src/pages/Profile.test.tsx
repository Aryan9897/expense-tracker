import { render, screen, fireEvent } from '@testing-library/react';
import { Profile } from './Profile';
import { vi } from 'vitest';

describe('Profile', () => {
    const mockProfile = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: '123-456-7890',
        jobTitle: 'Developer',
        company: 'Tech Corp',
        bio: 'Hello world',
    };

    const defaultProps = {
        profile: mockProfile,
        onSave: vi.fn(),
        onCancel: vi.fn(),
        onChangePassword: vi.fn(),
        isSaving: false,
        isGoogleUser: false,
    };

    test('renders profile form with initial data', () => {
        render(<Profile {...defaultProps} />);
        expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Tech Corp')).toBeInTheDocument();
    });

    test('updates form fields', () => {
        render(<Profile {...defaultProps} />);
        const firstNameInput = screen.getByLabelText(/First name/i);
        fireEvent.change(firstNameInput, { target: { value: 'Janet' } });
        expect(firstNameInput).toHaveValue('Janet');
    });

    test('submits updated profile', () => {
        render(<Profile {...defaultProps} />);
        fireEvent.change(screen.getByLabelText(/First name/i), { target: { value: 'Janet' } });

        fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));

        expect(defaultProps.onSave).toHaveBeenCalledWith({
            ...mockProfile,
            firstName: 'Janet'
        });
    });

    test('calls cancel', () => {
        render(<Profile {...defaultProps} />);
        fireEvent.click(screen.getByRole('button', { name: /Back/i }));
        expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    test('calls change password when not google user', () => {
        render(<Profile {...defaultProps} isGoogleUser={false} />);
        const changePasswordBtn = screen.getByRole('button', { name: /Change password/i });
        fireEvent.click(changePasswordBtn);
        expect(defaultProps.onChangePassword).toHaveBeenCalled();
    });

    test('hides change password button for google user', () => {
        render(<Profile {...defaultProps} isGoogleUser={true} />);
        expect(screen.queryByRole('button', { name: /Change password/i })).not.toBeInTheDocument();
    });

    test('email field is read only', () => {
        render(<Profile {...defaultProps} />);
        const emailInput = screen.getByLabelText(/Email/i);
        expect(emailInput).toHaveAttribute('readonly');
        expect(emailInput).toBeDisabled();
    });
});
