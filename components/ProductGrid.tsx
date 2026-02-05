import React from 'react';
import type { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
    products: Product[];
    onToggleCompare: (product: Product) => void;
    compareList: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onToggleCompare, compareList }) => {
    return (
        <div>
            {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map(p => (
                        <ProductCard 
                            key={p.id} 
                            product={p} 
                            onToggleCompare={onToggleCompare}
                            isComparing={compareList.some(item => item.id === p.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">No Products Found</h2>
                    <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria.</p>
                </div>
            )}
        </div>
    );
};

export default ProductGrid;