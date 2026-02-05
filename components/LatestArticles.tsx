

import React from 'react';
import type { Article } from '../types';
import ArticleCard from './ArticleCard';
import ArrowRightIcon from './icons/ArrowRightIcon';

interface LatestArticlesProps {
    articles: Article[];
}

const LatestArticles: React.FC<LatestArticlesProps> = ({ articles }) => {
    // Sort by creation date and take the latest 3
    const latestArticles = [...articles]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);

    if (latestArticles.length === 0) {
        return null; // Don't render the section if there are no articles
    }

    return (
        <div className="bg-gray-50 py-16">
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Latest Insights</h2>
                        <p className="mt-4 text-lg leading-6 text-gray-600">Explore our latest AI-generated articles and guides.</p>
                    </div>
                    <a
                        href="/site/blog"
                        className="hidden sm:inline-flex items-center font-semibold text-indigo-600 hover:text-indigo-500 transition-colors group"
                    >
                        View All Articles
                        <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {latestArticles.map(article => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
                 <a
                    href="/site/blog"
                    className="sm:hidden mt-8 inline-flex items-center font-semibold text-indigo-600 hover:text-indigo-500 transition-colors group"
                >
                    View All Articles
                    <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
            </div>
        </div>
    );
};

export default LatestArticles;