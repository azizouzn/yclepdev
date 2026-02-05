
import React from 'react';
import type { Product } from '../types';
import ArrowRightIcon from './icons/ArrowRightIcon';

interface InteractiveProductEmbedProps {
    product: Product;
}

const InteractiveProductEmbed: React.FC<InteractiveProductEmbedProps> = ({ product }) => {
    const analysis = product.analysisResult?.product_analysis;
    if (!analysis) return null;

    const score = analysis.overall_score;
    const getScoreColor = () => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="my-8 not-prose">
            <div className="bg-gray-50 rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col sm:flex-row items-center gap-6 p-6">
                <div className={`flex-shrink-0 w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl ${getScoreColor()} border-4 border-white`}>
                    {score}
                </div>
                <div className="flex-grow text-left">
                    <span className="text-xs font-bold uppercase text-indigo-600 tracking-wider">{analysis.category}</span>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{product.title}</h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{analysis.summary}</p>
                </div>
                <div className="flex-shrink-0 w-full sm:w-auto">
                     <a 
                        href={`/site/product/${product.id}`}
                        className="w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        View Review
                        <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default InteractiveProductEmbed;