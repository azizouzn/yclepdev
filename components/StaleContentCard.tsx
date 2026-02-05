
import React from 'react';
import type { Product } from '../types';
import ArrowPathIcon from './icons/ArrowPathIcon';
import XCircleIcon from './icons/XCircleIcon';

interface StaleContentCardProps {
    product: Product;
    onRefresh: () => void;
    onDismiss: () => void;
}

const StaleContentCard: React.FC<StaleContentCardProps> = ({ product, onRefresh, onDismiss }) => {
    return (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300">
            <p className="font-semibold text-yellow-900">{product.title}</p>
            <p className="text-sm text-yellow-700 mt-1">
                <strong>Reason:</strong> {product.staleReason || 'Needs review'}
            </p>
            <div className="flex items-center gap-3 mt-3">
                <button
                    onClick={onRefresh}
                    className="flex-1 text-sm flex justify-center items-center bg-white hover:bg-gray-100 text-indigo-600 font-semibold py-2 px-3 rounded-md border border-gray-300"
                >
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Refresh Analysis
                </button>
                 <button
                    onClick={onDismiss}
                    className="flex-1 text-sm flex justify-center items-center bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-3 rounded-md border border-gray-300"
                >
                    <XCircleIcon className="w-4 h-4 mr-2" />
                    Dismiss
                </button>
            </div>
        </div>
    );
};

export default StaleContentCard;