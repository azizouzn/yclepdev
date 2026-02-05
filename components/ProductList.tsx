

import React from 'react';
import type { Product, ConfirmedAction } from '../types';
import ProductListItem from './ProductListItem';
import RocketLaunchIcon from './icons/RocketLaunchIcon';
import { useData } from '../contexts/DataContext';
import ProductListItemSkeleton from './ProductListItemSkeleton';

interface ProductListProps {
  products: Product[];
  onViewResults: (product: Product) => void;
  onDelete: (product: Product) => void;
  onConfirmAction: (product: Product, action: ConfirmedAction) => void;
  onGetSuggestions: (product: Product) => Promise<void>;
  onGenerateVideoScript: (product: Product) => Promise<void>;
}

const ProductList: React.FC<ProductListProps> = ({ products, onViewResults, onDelete, onConfirmAction, onGetSuggestions, onGenerateVideoScript }) => {
  const { isLoading } = useData();
  
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Product Pipeline</h3>
      </div>
      <div className="card-content">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <ProductListItemSkeleton key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-3">
            {products.map((product, index) => (
              <div key={product.id} className="list-item-stagger" style={{ '--stagger-index': index } as React.CSSProperties}>
                <ProductListItem 
                  product={product} 
                  onViewResults={() => onViewResults(product)}
                  onDelete={() => onDelete(product)}
                  onConfirmAction={(action) => onConfirmAction(product, action)}
                  onGetSuggestions={() => onGetSuggestions(product)}
                  onGenerateVideoScript={() => onGenerateVideoScript(product)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 text-gray-500">
            <RocketLaunchIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-semibold text-gray-600">No Products Found</h4>
            <p className="text-sm">Add a new product to start the analysis or adjust your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;