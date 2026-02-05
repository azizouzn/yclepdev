

import React from 'react';
import type { Article } from '../types';
import ArticleCard from './ArticleCard';

interface BlogPageProps {
    articles: Article[];
}

const BlogPage: React.FC<BlogPageProps> = ({ articles }) => {
    const sortedArticles = [...articles].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return (
        <div className="bg-gray-50">
            <div className="container mx-auto px-4 md:px-8 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                        Yclep Content Hub
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
                        In-depth articles, guides, and insights powered by AI analysis.
                    </p>
                </div>
                {sortedArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {sortedArticles.map(article => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900">No Articles Yet</h2>
                        <p className="text-gray-500 mt-2">Come back soon to see our latest AI-generated content!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogPage;