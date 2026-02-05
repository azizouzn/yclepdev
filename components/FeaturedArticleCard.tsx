

import React from 'react';
import type { Article } from '../types';
import NewspaperIcon from './icons/NewspaperIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';

interface FeaturedArticleCardProps {
    article: Article;
}

const FeaturedArticleCard: React.FC<FeaturedArticleCardProps> = ({ article }) => {
    const title = article.analysisResult?.title || article.title;
    const snippet = article.analysisResult?.html_content
        ? article.analysisResult.html_content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...'
        : 'Article content is being generated...';

    return (
        <a href={`/site/blog/${article.id}`} className="group bg-card rounded-xl shadow-lg overflow-hidden transition-all duration-300 border border-border hover:border-primary/50 hover:shadow-2xl flex flex-col hover:shadow-primary/10">
            <div className="p-6 flex-grow">
                <div className="flex items-center gap-3 mb-3">
                    <NewspaperIcon className="w-6 h-6 text-green-400" />
                    <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Latest Article</h2>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground mb-4 h-20 line-clamp-4">{snippet}</p>
            </div>
            <div className="mt-auto p-6 bg-secondary/30 border-t border-border">
                <div
                    className="inline-flex items-center font-semibold text-primary/90 group-hover:text-primary transition-colors"
                >
                    Read Full Article
                    <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
            </div>
        </a>
    );
};

export default FeaturedArticleCard;