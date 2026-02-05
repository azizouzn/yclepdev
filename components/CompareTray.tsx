
import React from 'react';
import type { Product } from '../types';
import XMarkIcon from './icons/XMarkIcon';

interface CompareTrayProps {
    items: Product[];
    onRemove: (productId: number) => void;
    onClear: () => void;
    onCompare: () => void;
}

const CompareTray: React.FC<CompareTrayProps> = ({ items, onRemove, onClear, onCompare }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t-2 border-indigo-500 z-30 shadow-2xl transform-gpu">
            <div className="container mx-auto px-4 md:px-8 py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold text-gray-900 hidden md:block">Compare Products ({items.length}/3)</h3>
                        <div className="flex items-center gap-3">
                            {items.map(item => (
                                <div key={item.id} className="relative group bg-gray-200 p-1 rounded-md">
                                    <p className="text-gray-800 text-sm truncate w-24">{item.title}</p>
                                    <button
                                        onClick={() => onRemove(item.id)}
                                        className="absolute -top-2 -right-2 bg-red-600 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label={`Remove ${item.title}`}
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {[...Array(3 - items.length)].map((_, i) => (
                                 <div key={i} className="w-24 h-8 bg-gray-100 rounded-md border-2 border-dashed border-gray-300"></div>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button 
                            onClick={onCompare} 
                            disabled={items.length < 2}
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Compare Now
                        </button>
                         <button 
                            onClick={onClear}
                            className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompareTray;
