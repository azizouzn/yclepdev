import React from 'react';
import type { Product } from '../../types';
import ProductCard from '../ProductCard';

interface FeaturedProductsProps {
    products: Product[];
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products }) => {
    if (products.length === 0) return null;

    return (
        <div className="bg-gray-800/50 py-12">
            <div className="container mx-auto px-4 md:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Featured Recommendations</h2>
                    <p className="mt-4 text-lg leading-6 text-gray-400">Our top-rated products, analyzed and selected by our AI.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map(p => (
                        <ProductCard 
                            key={p.id} 
                            product={p}
                            onToggleCompare={() => {}}
                            isComparing={false}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeaturedProducts;