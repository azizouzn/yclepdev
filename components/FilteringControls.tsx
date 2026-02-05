import React from 'react';
import type { SortOption } from '../types';

interface FilteringControlsProps {
    categories: string[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    sortOption: SortOption;
    onSortChange: (option: SortOption) => void;
}

const FilteringControls: React.FC<FilteringControlsProps> = ({
    categories,
    selectedCategory,
    onCategoryChange,
    sortOption,
    onSortChange
}) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-700">
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <label htmlFor="category-filter" className="text-sm font-medium text-gray-300 whitespace-nowrap">
                    Filter by:
                </label>
                <select
                    id="category-filter"
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="w-full sm:w-auto bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat} className="capitalize">{cat === 'all' ? 'All Categories' : cat}</option>
                    ))}
                </select>
            </div>
             <div className="flex items-center gap-4 w-full sm:w-auto">
                <label htmlFor="sort-by" className="text-sm font-medium text-gray-300 whitespace-nowrap">
                    Sort by:
                </label>
                <select
                    id="sort-by"
                    value={sortOption}
                    onChange={(e) => onSortChange(e.target.value as SortOption)}
                    className="w-full sm:w-auto bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="score">Best Score</option>
                    <option value="newest">Newest</option>
                    <option value="name">A-Z</option>
                </select>
            </div>
        </div>
    );
};

export default FilteringControls;