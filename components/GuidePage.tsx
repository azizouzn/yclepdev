
import React from 'react';
import type { Guide, Product } from '../types';
import InteractiveProductEmbed from './InteractiveProductEmbed';
import { extractBodyContent } from '../utils/htmlUtils';
import FeedbackWidget from './FeedbackWidget';

interface GuideViewProps {
    guide: Guide;
    allProducts: Product[];
}

const GuidePage: React.FC<GuideViewProps> = ({ guide, allProducts }) => {
    
    // Safely handle potentially missing content to prevent crashes
    if (!guide.html_content) {
         return (
            <div className="p-8 text-center text-gray-600 bg-gray-50 h-full flex flex-col justify-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{guide.title}</h1>
                <p>The content for this guide is not yet available.</p>
            </div>
        );
    }
    const contentParts = guide.html_content.split(/(\[EMBED_PRODUCT:\d+\])/g);

    return (
        <div className="bg-white text-gray-800 px-4 md:px-8 py-12 max-w-4xl mx-auto">
            <header className="mb-8 pb-4 border-b">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
                    {guide.title}
                </h1>
                <p className="text-sm text-gray-500">
                    Published on {new Date(guide.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </header>

            <div className="prose lg:prose-xl max-w-none text-gray-700 prose-indigo">
                {contentParts.map((part, index) => {
                    const match = part.match(/\[EMBED_PRODUCT:(\d+)\]/);
                    if (match) {
                        const productId = parseInt(match[1], 10);
                        const product = allProducts.find(p => p.id === productId);
                        return product ? <InteractiveProductEmbed key={index} product={product} /> : null;
                    }
                    // A simple regex to convert markdown-like links into HTML anchors
                    const htmlPart = part.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
                    return <div key={index} dangerouslySetInnerHTML={{ __html: extractBodyContent(htmlPart) }} />;
                })}
            </div>

            <FeedbackWidget />
        </div>
    );
};

export default GuidePage;
