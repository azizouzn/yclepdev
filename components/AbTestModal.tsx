
import React, { useEffect, useRef } from 'react';
import type { AbTest } from '../types';
import XCircleIcon from './icons/XCircleIcon';
import MegaphoneIcon from './icons/MegaphoneIcon';

interface AbTestModalProps {
    isOpen: boolean;
    onClose: () => void;
    abTest: AbTest;
    onApply: () => void;
}

const AbTestModal: React.FC<AbTestModalProps> = ({ isOpen, onClose, abTest, onApply }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const modalElement = modalRef.current;
        if (!modalElement) return;

        const focusableElements = modalElement.querySelectorAll<HTMLElement>('button');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
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
        const timer = setTimeout(() => firstElement?.focus(), 100);

        return () => {
            clearTimeout(timer);
            modalElement.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);


    if (!isOpen) return null;

    const TestVersionCard: React.FC<{ title: string; headline: string; body: string; isVariant?: boolean }> = ({ title, headline, body, isVariant }) => (
        <div className={`p-4 rounded-lg border-2 ${isVariant ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white'}`}>
            <h4 className={`text-sm font-bold uppercase tracking-wider ${isVariant ? 'text-indigo-600' : 'text-gray-500'}`}>{title}</h4>
            <div className="mt-4">
                <p className="font-semibold text-gray-800">{headline}</p>
                <p className="text-sm text-gray-600 mt-2">{body}</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                ref={modalRef}
                onClick={e => e.stopPropagation()}
                className="bg-gray-100 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ab-test-title"
            >
                 <header className="p-4 flex items-center justify-between border-b border-gray-200 bg-white rounded-t-lg">
                    <h2 id="ab-test-title" className="text-xl font-bold text-gray-900 flex items-center">
                        <MegaphoneIcon className="w-6 h-6 mr-3 text-indigo-500"/>
                        A/B Test Suggestion
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800" aria-label="Close">
                        <XCircleIcon className="w-8 h-8" />
                    </button>
                </header>
                <main className="flex-grow p-6 overflow-y-auto">
                    <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800">Agent's Reasoning:</h3>
                        <p className="text-sm text-gray-600 italic">{abTest.reasoning}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TestVersionCard title="Control (Version A)" headline={abTest.control.headline} body={abTest.control.body} />
                        <TestVersionCard title="Variant (Version B)" headline={abTest.variant.headline} body={abTest.variant.body} isVariant />
                    </div>
                </main>
                 <footer className="p-4 bg-white border-t border-gray-200 rounded-b-lg flex justify-end gap-3">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md">
                        Reject
                    </button>
                    <button onClick={onApply} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md">
                        Apply Variant
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AbTestModal;