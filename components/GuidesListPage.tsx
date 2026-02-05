

import React from 'react';
import type { Guide, Product } from '../types';
import GuideCard from './GuideCard';
import BookOpenIcon from './icons/BookOpenIcon';

interface GuidesListPageProps {
    guides: Guide[];
    products: Product[];
}

const GuidesListPage: React.FC<GuidesListPageProps> = ({ guides, products }) => {
    return (
        <div className="bg-gray-50">
            <div className="container mx-auto px-4 md:px-8 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                        Guides & Buying Manuals
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
                        In-depth guides to help you make the best purchasing decisions, powered by AI analysis.
                    </p>
                </div>
                {guides.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {guides.map(guide => (
                            <GuideCard key={guide.id} guide={guide} products={products} />
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                        <BookOpenIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-2xl font-bold text-gray-900">No Guides Published Yet</h2>
                        <p className="text-gray-500 mt-2">Check back soon for our in-depth buying advice!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuidesListPage;