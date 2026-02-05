
import React, { useMemo } from 'react';
import type { Product } from '../types';
import ArrowRightIcon from './icons/ArrowRightIcon';
import ScaleIcon from './icons/ScaleIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import PhotoIcon from './icons/PhotoIcon';

interface ProductCardProps {
  product: Product;
  onToggleCompare: (product: Product) => void;
  isComparing: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onToggleCompare, isComparing }) => {
  // Derived state optimization
  const score = product.analysisResult?.product_analysis?.overall_score ?? product.score ?? 0;
  const category = product.analysisResult?.product_analysis?.category;
  const featuredImage = product.visualAssets?.featuredImage;
  const summary = product.analysisResult?.product_analysis?.summary ?? 'No summary available.';
  
  const scoreColorClass = useMemo(() => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-100 border-emerald-200';
    if (score >= 60) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    return 'text-red-700 bg-red-100 border-red-200';
  }, [score]);
  
  return (
    <div className={`group flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${isComparing ? 'ring-2 ring-indigo-500 shadow-md' : 'border border-gray-100 shadow-sm hover:shadow-lg'}`}>
      
      {/* Image Section */}
      <a href={`/site/product/${product.id}`} className="block relative aspect-[16/9] overflow-hidden bg-gray-50">
        {featuredImage ? (
          <img 
            src={featuredImage} 
            alt={product.title} 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
            loading="lazy" 
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-300">
            <PhotoIcon className="w-12 h-12 opacity-50" />
          </div>
        )}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-bold border shadow-sm backdrop-blur-md ${scoreColorClass}`}>
            {score.toFixed(0)}
        </div>
      </a>
      
      {/* Content Section */}
      <div className="flex flex-col flex-grow p-5">
        <div className="mb-2">
            {category && (
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1.5">{category}</span>
            )}
            <a href={`/site/product/${product.id}`} className="block">
                <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2" title={product.title}>{product.title}</h3>
            </a>
        </div>
        
        <p className="text-sm text-gray-500 line-clamp-3 mb-5 flex-grow leading-relaxed font-light">{summary}</p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
             <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompare(product);
                }}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${isComparing ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                {isComparing ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <ScaleIcon className="w-3.5 h-3.5" />}
                <span>{isComparing ? 'Added' : 'Compare'}</span>
            </button>

            <a
              href={`/site/product/${product.id}`}
              className="text-sm font-semibold text-gray-900 flex items-center gap-1 hover:gap-2 transition-all hover:text-indigo-600"
            >
              Read Review
              <ArrowRightIcon className="w-4 h-4" />
            </a>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
