
import React from 'react';

const ProductListItemSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-200">
      <div className="flex-grow w-full sm:w-auto animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between animate-pulse">
        <div className="h-6 bg-gray-200 rounded-full w-24"></div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductListItemSkeleton;
