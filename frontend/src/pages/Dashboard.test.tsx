import { render, screen, fireEvent } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { vi } from 'vitest';

// Mock scrollIntoView since it's not defined in jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Dashboard', () => {
    const defaultProps = {
        email: 'test@example.com',
        onSignOut: vi.fn(),
        onOpenProfile: vi.fn(),
    };

    test('renders welcome message', () => {
        render(<Dashboard {...defaultProps} />);
        expect(screen.getByText('Welcome back')).toBeInTheDocument();
    });

    test('shows empty state initially', () => {
        render(<Dashboard {...defaultProps} />);
        expect(
            screen.getByText('No activity, get started by adding your expenses')
        ).toBeInTheDocument();
    });

    test('opens add expense modal when clicking add button', () => {
        render(<Dashboard {...defaultProps} />);
        const addButton = screen.getByText('Add expense');
        fireEvent.click(addButton);

        expect(screen.getByRole('heading', { name: 'Add Expense' })).toBeInTheDocument(); // Modal title
        expect(screen.getByLabelText('Merchant')).toBeInTheDocument();
    });

    test('adds a new expense', async () => {
        render(<Dashboard {...defaultProps} />);

        // Open modal
        fireEvent.click(screen.getByText('Add expense'));

        // Fill form
        fireEvent.change(screen.getByLabelText('Merchant'), { target: { value: 'Test Cafe' } });
        fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Coffee' } });
        fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '15.50' } });
        fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2023-10-25' } });
        fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'cleared' } });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }));

        // Verify expense is added to list and modal closed
        const expenses = await screen.findAllByText('Test Cafe');
        expect(expenses.length).toBeGreaterThan(0);
        expect(expenses[0]).toBeInTheDocument();
        expect(screen.queryByText('No activity, get started by adding your expenses')).not.toBeInTheDocument();
    });

    test('adds a new expense with custom category', async () => {
        render(<Dashboard {...defaultProps} />);

        // Open modal
        fireEvent.click(screen.getByText('Add expense'));

        // Fill form with custom category
        fireEvent.change(screen.getByLabelText('Merchant'), { target: { value: 'Gym Membership' } });
        fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'create-new' } });
        fireEvent.change(screen.getByLabelText('New Category Name'), { target: { value: 'Fitness' } });
        fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '50.00' } });
        fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2023-10-26' } });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }));

        // Verify expense is added
        // Custom logic to wait for the item to appear in the list, handling potential duplicates from previous tests
        const expenses = await screen.findAllByText('Gym Membership');
        expect(expenses.length).toBeGreaterThan(0);
        expect(expenses[0]).toBeInTheDocument();

        const categories = await screen.findAllByText('Fitness');
        expect(categories.length).toBeGreaterThan(0);
        expect(categories[0]).toBeInTheDocument();

        // Verify custom category persists in dropdown for next expense
        fireEvent.click(screen.getByText('Add expense'));
        expect(screen.getByRole('option', { name: 'Fitness' })).toBeInTheDocument();
    });
});
