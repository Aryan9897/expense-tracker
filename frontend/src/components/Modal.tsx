import { ReactNode, useEffect } from 'react';
import styles from './Modal.module.css';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
};

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className={styles.modal} role="dialog" aria-modal="true">
                <button
                    onClick={onClose}
                    className={styles.closeButton}
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                {title && <h2 style={{ marginBottom: '20px', fontSize: '1.25rem', fontWeight: 600 }}>{title}</h2>}
                {children}
            </div>
        </div>
    );
}
