import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';
import { vi } from 'vitest';

describe('Modal', () => {
    it('renders children when open', () => {
        render(
            <Modal isOpen={true} onClose={() => { }}>
                <div data-testid="modal-content">Modal Content</div>
            </Modal>
        );
        expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(
            <Modal isOpen={false} onClose={() => { }}>
                <div data-testid="modal-content">Modal Content</div>
            </Modal>
        );
        expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const handleClose = vi.fn();
        render(
            <Modal isOpen={true} onClose={handleClose}>
                <div>Content</div>
            </Modal>
        );
        const closeButton = screen.getByLabelText('Close modal');
        fireEvent.click(closeButton);
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});
