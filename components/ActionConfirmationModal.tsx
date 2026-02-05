

import React, { useState, useRef, useEffect } from 'react';
import type { Product, ConfirmedAction } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import CheckCircleIcon from './icons/CheckCircleIcon';
import CloudArrowUpIcon from './icons/CloudArrowUpIcon';
import CloudArrowDownIcon from './icons/CloudArrowDownIcon';
import ArrowTopRightOnSquareIcon from './icons/ArrowTopRightOnSquareIcon';

interface ActionConfirmationModalProps {
    product: Product;
    actionType: ConfirmedAction;
    onConfirm: () => Promise<string>; // Returns a success message
    onCancel: () => void;
}

const actionConfig = {
    PUBLISH: {
        title: 'Publish Product',
        message: 'Are you sure you want to publish this product? It will become live on the public site.',
        Icon: CloudArrowUpIcon,
        buttonClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        buttonText: 'Publish',
        color: 'green'
    },
    UNPUBLISH: {
        title: 'Unpublish Product',
        message: 'Are you sure you want to unpublish this product? It will be removed from the public site.',
        Icon: CloudArrowDownIcon,
        buttonClass: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500',
        buttonText: 'Unpublish',
        color: 'yellow'
    }
};

const ActionConfirmationModal: React.FC<ActionConfirmationModalProps> = ({ product, actionType, onConfirm, onCancel }) => {
    const { showNotification } = useNotification();
    const [isConfirmed, setIsConfirmed] = useState(false);
    const config = actionConfig[actionType];
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
    }, [onCancel, isConfirmed]);


    const handleConfirm = async () => {
        const message = await onConfirm();
        if (message) {
            showNotification(message, 'success');
            setIsConfirmed(true);
        }
    };

    const handleViewPublicPage = () => {
        window.open(`/site/product/${product.id}`, '_blank');
        onCancel();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onCancel}>
            <div 
                ref={modalRef}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md text-center"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-${config.color}-100`}>
                    {isConfirmed ? 
                        <CheckCircleIcon className={`h-6 w-6 text-${config.color}-600`} /> :
                        <config.Icon className={`h-6 w-6 text-${config.color}-600`} aria-hidden="true" />
                    }
                </div>
                <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        {isConfirmed ? 'Success!' : config.title}
                    </h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500" id="modal-description">
                            {isConfirmed ? (
                                <>Product <strong className="font-bold text-gray-800">"{product.title}"</strong> has been successfully {actionType.toLowerCase()}ed.</>
                            ) : (
                                <>{config.message}</>
                            )}
                        </p>
                    </div>
                </div>

                {isConfirmed ? (
                    <div className="mt-5 sm:mt-6 flex flex-col gap-3">
                        {actionType === 'PUBLISH' && (
                             <button
                                type="button"
                                className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500 sm:text-sm"
                                onClick={handleViewPublicPage}
                            >
                                View Public Page <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2"/>
                            </button>
                        )}
                        <button
                            ref={cancelButtonRef}
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500 sm:text-sm"
                            onClick={onCancel}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3">
                        <button
                            type="button"
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white sm:text-sm ${config.buttonClass}`}
                            onClick={handleConfirm}
                        >
                            {config.buttonText}
                        </button>
                        <button
                            ref={cancelButtonRef}
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500 sm:text-sm"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// FIX: Added default export to make the component importable in Dashboard.tsx.
export default ActionConfirmationModal;
