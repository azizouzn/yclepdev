

import React, { useRef, useEffect } from 'react';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import { useNotification } from '../contexts/NotificationContext';

interface DeleteConfirmationModalProps {
    itemName: string;
    onConfirm: () => Promise<string>; // Returns a success message
    onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ itemName, onConfirm, onCancel }) => {
    const { showNotification } = useNotification();
    const modalRef = useRef<HTMLDivElement>(null);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!modalRef.current) return;
        const modalElement = modalRef.current;
        
        const focusableElements = modalElement.querySelectorAll<HTMLElement>('button');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
            if (e.key !== 'Tab') return;

            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        };

        modalElement.addEventListener('keydown', handleKeyDown);
        
        const timer = setTimeout(() => {
            cancelButtonRef.current?.focus();
        }, 100);

        return () => {
          clearTimeout(timer);
          modalElement.removeEventListener('keydown', handleKeyDown);
        };
    }, [onCancel]);

    const handleConfirm = async () => {
        const message = await onConfirm();
        if (message) {
            showNotification(message, 'success');
        }
    };

    return (
        <div className="dialog-overlay" onClick={onCancel}>
            <div 
                ref={modalRef}
                className="dialog-content max-w-md" 
                onClick={e => e.stopPropagation()}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <div className="p-6 text-center">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10">
                      <ExclamationTriangleIcon className="h-6 w-6 text-destructive" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                      <h3 className="text-lg leading-6 font-medium text-foreground" id="modal-title">
                          Delete Item
                      </h3>
                      <div className="mt-2">
                          <p className="text-sm text-muted-foreground" id="modal-description">
                              Are you sure you want to delete <strong className="font-bold text-foreground">"{itemName}"</strong>? This action cannot be undone.
                          </p>
                      </div>
                  </div>
                </div>
                <div className="bg-secondary/50 p-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 rounded-b-lg">
                    <button
                        ref={cancelButtonRef}
                        type="button"
                        className="btn btn-secondary w-full sm:w-auto"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                     <button
                        type="button"
                        className="btn btn-destructive w-full sm:w-auto mb-2 sm:mb-0"
                        onClick={handleConfirm}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;