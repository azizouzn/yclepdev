

import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { getPreferredCategories } from '../utils/personalization';
import { useData } from '../contexts/DataContext';
import SparklesIcon from './icons/SparklesIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';
import ProductCard from './ProductCard';

const PersonalizedRecommendations: React.FC = () => {
    const { products } = useData();
    const [recommendation, setRecommendation] = useState<{ text: string; productIds: number[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendation = async () => {
            const preferredCategories = getPreferredCategories();
            if (preferredCategories.length === 0) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/recommendations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        categories: preferredCategories,
                        products: products.filter(p => p.status === 'published').map(p => ({
                            id: p.id,
                            title: p.title,
                            category: p.analysisResult?.product_analysis.category,
                            summary: p.analysisResult?.product_analysis.summary,
                        })),
                    }),
                });
                if (response.ok) {
                    const data = await response.json();
                    setRecommendation(data);
                }
            } catch (error) {
                console.error("Failed to fetch recommendations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (products.length > 0) {
            fetchRecommendation();
        }
    }, [products]);
    
    const recommendedProducts = recommendation ? products.filter(p => recommendation.productIds.includes(p.id)) : [];

    if (isLoading) {
        return (
            <div className="bg-gray-100 py-12">
                <div className="container mx-auto px-4 md:px-8 text-center text-gray-500">
                    <ArrowPathIcon className="w-8 h-8 mx-auto animate-spin mb-2" />
                    <p>Generating recommendations...</p>
                </div>
            </div>
        );
    }

    if (!recommendation || recommendedProducts.length === 0) {
        return null; // Don't render if no preferences or no recommendation
    }

    return (
        <div className="bg-emerald-50 py-16">
            <div className="container mx-auto px-4 md:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl flex items-center justify-center gap-3">
                         <SparklesIcon className="w-8 h-8 text-emerald-500" />
                        Just For You
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-gray-600 max-w-2xl mx-auto">{recommendation.text}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {recommendedProducts.map(p => (
                        <ProductCard 
                            key={p.id} 
                            product={p}
                            onToggleCompare={() => {}} // Compare functionality not needed here
                            isComparing={false}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PersonalizedRecommendations;