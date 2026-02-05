

import React from 'react';
import type { Guide } from '../types';
import BookOpenIcon from './icons/BookOpenIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';

interface FeaturedGuideCardProps {
    guide: Guide;
}

const FeaturedGuideCard: React.FC<FeaturedGuideCardProps> = ({ guide }) => {
    const snippet = guide.html_content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';

    return (
        <a href={`/site/guide/${guide.id}`} className="group bg-card rounded-xl shadow-lg overflow-hidden transition-all duration-300 border border-border hover:border-primary/50 hover:shadow-2xl flex flex-col hover:shadow-primary/10">
            <div className="p-6 flex-grow">
                <div className="flex items-center gap-3 mb-3">
                    <BookOpenIcon className="w-6 h-6 text-primary" />
                    <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Featured Guide</h2>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{guide.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 h-20 line-clamp-4">{snippet}</p>
            </div>
            <div className="mt-auto p-6 bg-secondary/30 border-t border-border">
                <div
                    className="inline-flex items-center font-semibold text-primary/90 group-hover:text-primary transition-colors"
                >
                    Read The Full Guide
                    <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
            </div>
        </a>
    );
};

export default FeaturedGuideCard;