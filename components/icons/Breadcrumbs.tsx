
import React from 'react';
import type { Product } from '../../types';
import ChevronRightIcon from './ChevronRightIcon';

interface BreadcrumbsProps {
    product: Product;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ product }) => {
    const category = product.analysisResult?.product_analysis?.category;

    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <a href="/site" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600">
                        Home
                    </a>
                </li>
                {category && (
                    <li>
                        <div className="flex items-center">
                            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                            <a href="/site" className="ml-1 text-sm font-medium text-gray-700 hover:text-indigo-600 md:ml-2 capitalize">
                                {category}
                            </a>
                        </div>
                    </li>
                )}
                <li aria-current="page">
                    <div className="flex items-center">
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                        <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{product.title}</span>
                    </div>
                </li>
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
