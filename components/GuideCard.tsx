import React from 'react';
import type { Guide, Product } from '../types';
import ArrowRightIcon from './icons/ArrowRightIcon';

interface GuideCardProps {
    guide: Guide;
    products: Product[];
}

const GuideCard: React.FC<GuideCardProps> = ({ guide, products }) => {
    const snippet = guide.html_content.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...';
    
    return (
        <div className="group bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 border border-gray-200 hover:border-emerald-500 flex flex-col hover:shadow-emerald-500/10">
            <a href={`/site/guide/${guide.id}`} className="block flex-grow">
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{guide.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 h-16">{snippet}</p>
                </div>
            </a>
            <div className="mt-auto p-6 bg-gray-50 border-t border-gray-200">
                <a
                    href={`/site/guide/${guide.id}`}
                    className="inline-flex items-center font-semibold text-emerald-600 group-hover:text-emerald-700 transition-colors"
                >
                    Read The Guide
                    <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
            </div>
        </div>
    );
};

export default React.memo(GuideCard);