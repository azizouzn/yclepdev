
import React from 'react';
import type { Product } from '../types';
import ArrowRightIcon from './icons/ArrowRightIcon';
import TrophyIcon from './icons/TrophyIcon';

interface TopRatedProductProps {
  product: Product;
}

const TopRatedProduct: React.FC<TopRatedProductProps> = ({ product }) => {
    const analysis = product.analysisResult?.product_analysis;
    if (!analysis) return null;

    const score = analysis.overall_score;
    const getScoreColor = () => {
        if (score >= 80) return 'text-green-500 border-green-500';
        if (score >= 60) return 'text-yellow-500 border-yellow-500';
        return 'text-red-500 border-red-500';
    };

    return (
        <div className="bg-white rounded-lg shadow-lg mb-12 p-8 border-2 border-indigo-500/30 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                    <TrophyIcon className="w-6 h-6 text-yellow-400" />
                    <h2 className="text-sm font-bold uppercase text-yellow-500 tracking-wider">Top Rated Product</h2>
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900 mb-2">{product.title}</h3>
                <p className="text-gray-500 mb-4">{analysis.verdict}</p>
                 <a 
                    href={`#/site/product/${product.id}`}
                    className="inline-flex items-center font-semibold text-indigo-600 hover:text-indigo-500 transition-colors group"
                    >
                    Read Our In-Depth Review
                    <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
            </div>
            <div className="flex-shrink-0 text-center">
                 <div className={`w-28 h-28 rounded-full flex items-center justify-center border-4 ${getScoreColor()} bg-gray-50`}>
                    <span className="text-4xl font-bold text-gray-800">{score}</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">Overall Score</p>
            </div>
        </div>
    );
};

export default TopRatedProduct;
