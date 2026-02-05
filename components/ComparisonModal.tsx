

import React, { useRef, useEffect } from 'react';
import type { Product, FactualStatement, ProductAnalysis } from '../types';
import XCircleIcon from './icons/XCircleIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface ComparisonModalProps {
    items: Product[];
    onClose: () => void;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ items, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (items.length === 0) return;

        const modalElement = modalRef.current;
        if (!modalElement) return;

        const focusableElements = modalElement.querySelectorAll<HTMLElement>('button, a[href]');
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

        const timer = setTimeout(() => {
            firstElement?.focus();
        }, 100);

        return () => {
            clearTimeout(timer);
            modalElement.removeEventListener('keydown', handleKeyDown);
        };
    }, [items.length, onClose]);


    if (items.length === 0) return null;

    const attributes = [
        { label: 'Overall Score', key: 'overall_score' },
        { label: 'Key Features', key: 'key_features' },
        { label: 'Pros', key: 'pros' },
        { label: 'Cons', key: 'cons' },
    ];
    
    // FIX: Restructured the function to handle all possible types of `value` correctly, resolving the ReactNode type error.
    const renderValue = (product: Product, key: string): React.ReactNode => {
        const analysis = product.analysisResult?.product_analysis;
        if (!analysis) return <span className="text-gray-400">N/A</span>;
        
        const value = analysis[key as keyof ProductAnalysis];

        if (key === 'overall_score' && typeof value === 'number') {
            const score = value;
            const getColor = () => {
                if (score >= 80) return 'text-green-600';
                if (score >= 60) return 'text-yellow-600';
                return 'text-red-600';
            };
            return <span className={`font-bold text-2xl ${getColor()}`}>{score}</span>;
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return <span className="text-gray-400">N/A</span>;
            }
            // Type guard for FactualStatement[]
            if (typeof value[0] === 'object' && value[0] !== null && 'statement' in value[0]) {
                const icon = key === 'pros' ? <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /> : 
                             key === 'cons' ? <XCircleIcon className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" /> : 
                             <div className="w-4 h-4 mr-2 flex-shrink-0" />;

                return (
                    <ul className="space-y-2">
                        {(value as FactualStatement[]).map((item, index) => <li key={index} className="flex items-start">{icon}{item.statement}</li>)}
                    </ul>
                );
            }
            // Fallback for simple string arrays
             if (typeof value[0] === 'string') {
                return (
                     <ul className="space-y-2">
                        {(value as string[]).map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                )
             }
        }
        
        if (typeof value === 'string' || typeof value === 'number') {
             return String(value);
        }

        return <span className="text-gray-400">N/A</span>;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                ref={modalRef}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-labelledby="comparison-modal-title"
            >
                <header className="p-4 flex items-center justify-between border-b border-gray-200">
                    <h2 id="comparison-modal-title" className="text-2xl font-bold text-gray-900">Product Comparison</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800" aria-label="Close">
                        <XCircleIcon className="w-8 h-8" />
                    </button>
                </header>
                <div className="flex-grow overflow-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3 w-1/5">Attribute</th>
                                {items.map(item => (
                                    <th key={item.id} scope="col" className="px-6 py-3">
                                        {item.title}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {attributes.map(attr => (
                                <tr key={attr.key} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap align-top">
                                        {attr.label}
                                    </th>
                                    {items.map(item => (
                                        <td key={item.id} className="px-6 py-4 align-top">
                                            {renderValue(item, attr.key)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                             <tr className="bg-white">
                                 <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"></th>
                                 {items.map(item => (
                                     <td key={item.id} className="px-6 py-4">
                                         <a
                                            href={`/site/product/${item.id}`}
                                            className="font-medium text-indigo-600 hover:underline"
                                          >
                                            View Full Review &rarr;
                                          </a>
                                     </td>
                                 ))}
                             </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ComparisonModal;