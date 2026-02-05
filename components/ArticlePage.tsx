


import React, { useEffect, useState, useMemo } from 'react';
import type { Article, Product } from '../types';
import { extractBodyContent } from '../utils/htmlUtils';
import FeedbackWidget from './FeedbackWidget';
import ArrowRightIcon from './icons/ArrowRightIcon';
import PhotoIcon from './icons/PhotoIcon';
import SeoHead from './SeoHead';
import ClockIcon from './icons/ClockIcon';
import CalendarIcon from './icons/CalendarIcon';
import ShareIcon from './icons/ShareIcon';
import LightBulbIcon from './icons/LightBulbIcon';

interface ArticleViewProps {
    article: Article;
    allProducts: Product[];
}

const RelatedProductItem: React.FC<{ product: Product }> = ({ product }) => (
    <a href={`/site/product/${product.id}`} className="group bg-white rounded-lg p-4 flex items-center gap-4 border border-gray-200 hover:shadow-md hover:border-indigo-400 transition-all mb-4">
        {product.visualAssets?.featuredImage ? (
            <img src={product.visualAssets.featuredImage} alt={product.title} className="w-16 h-16 rounded-md object-cover flex-shrink-0" loading="lazy" />
        ) : (
          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-md flex-shrink-0">
            <PhotoIcon className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <div className="flex-grow">
            <h4 className="font-bold text-gray-800 text-sm group-hover:text-indigo-600 line-clamp-2">{product.title}</h4>
            <div className="flex items-center gap-2 mt-1">
                <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${product.score >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {product.score} / 100
                </div>
            </div>
        </div>
        <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1 flex-shrink-0" />
    </a>
);

const KeyTakeaways: React.FC<{ points: string[] }> = ({ points }) => {
    if (!points || points.length === 0) return null;
    return (
        <div className="mb-10 bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-lg shadow-sm">
            <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <LightBulbIcon className="w-6 h-6 text-indigo-600" />
                Key Takeaways (TL;DR)
            </h3>
            <ul className="space-y-3">
                {points.map((point, index) => (
                    <li key={index} className="flex items-start text-indigo-800 text-base font-medium">
                        <span className="mr-3 mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-400"></span>
                        {point}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const TableOfContents: React.FC<{ headers: { id: string; text: string; level: number }[]; activeId: string }> = ({ headers, activeId }) => {
    if (headers.length === 0) return null;

    return (
        <nav className="sticky top-24 self-start overflow-y-auto max-h-[calc(100vh-8rem)] p-4 bg-gray-50/50 rounded-xl border border-gray-100 backdrop-blur-sm">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Table of Contents</h4>
            <ul className="space-y-1">
                {headers.map((header) => (
                    <li key={header.id} style={{ paddingLeft: `${(header.level - 2) * 0.75}rem` }}>
                        <a
                            href={`#${header.id}`}
                            className={`toc-link block py-1 text-sm transition-colors duration-200 border-l-2 pl-3 ${
                                activeId === header.id
                                    ? 'border-indigo-500 text-indigo-600 font-medium'
                                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                            }`}
                            onClick={(e) => {
                                e.preventDefault();
                                document.querySelector(`#${header.id}`)?.scrollIntoView({
                                    behavior: 'smooth'
                                });
                            }}
                        >
                            {header.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

const ArticlePage: React.FC<ArticleViewProps> = ({ article, allProducts }) => {
    const [readingProgress, setReadingProgress] = useState(0);
    const [headers, setHeaders] = useState<{ id: string; text: string; level: number }[]>([]);
    const [activeHeaderId, setActiveHeaderId] = useState<string>('');
    const [processedHtml, setProcessedHtml] = useState<string>('');

    const analysisResult = article?.analysisResult;

    // Related Products (kept as a hook, guarded for absent analysisResult)
    const relatedProducts = useMemo(() => {
        if (!analysisResult) return [] as Product[];
        const categories = analysisResult.suggested_categories || [];
        return allProducts.filter(product => 
            categories.includes(product.analysisResult?.product_analysis?.category || '')
        ).slice(0, 3);
    }, [allProducts, analysisResult?.suggested_categories]);

    // 1. Reading Progress Logic
    useEffect(() => {
        const updateScrollProgress = () => {
            const currentScroll = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollHeight) {
                setReadingProgress(Number((currentScroll / scrollHeight).toFixed(2)) * 100);
            }
        };
        window.addEventListener('scroll', updateScrollProgress);
        return () => window.removeEventListener('scroll', updateScrollProgress);
    }, []);

    // 2. Parse Content, Generate IDs for TOC, and Inject into HTML
    useEffect(() => {
        if (!analysisResult?.html_content) return;

        const rawHtml = extractBodyContent(analysisResult.html_content);
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');
        
        const extractedHeaders: { id: string; text: string; level: number }[] = [];
        const headerElements = doc.querySelectorAll('h2, h3');

        headerElements.forEach((el, index) => {
            const text = el.textContent || '';
            // Create a URL-friendly ID
            const id = text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') || `header-${index}`;
            
            el.id = id;
            extractedHeaders.push({
                id,
                text,
                level: parseInt(el.tagName.substring(1)),
            });
        });

        setHeaders(extractedHeaders);
        
        // Add lazy loading to images
        const images = doc.querySelectorAll('img');
        images.forEach(img => {
            img.setAttribute('loading', 'lazy');
            img.setAttribute('decoding', 'async');
            // Simple styling fix for images coming from external sources
            img.style.borderRadius = '0.75rem'; 
            img.style.margin = '2rem auto';
        });

        // Add target="_blank" to external links
        const links = doc.querySelectorAll('a');
        links.forEach(link => {
            if (link.href.startsWith('http') && !link.href.includes(window.location.hostname)) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });

        setProcessedHtml(doc.body.innerHTML);

    }, [analysisResult?.html_content]);

    // 3. Active Header Spy Logic
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveHeaderId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -66% 0px' }
        );

        headers.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [headers, processedHtml]); // Re-run when HTML is injected

    if (!analysisResult) {
        return (
            <div className="p-12 text-center text-gray-500 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Generating Insights...</h1>
                <p>The AI is crafting this article. Please check back shortly.</p>
            </div>
        );
    }

    
    // Reading time estimation
    const wordCount = processedHtml.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Schema for SEO
    const schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": analysisResult.title,
        "datePublished": article.created_at,
        "author": { "@type": "Organization", "name": "Yclep AI" },
        "publisher": { "@type": "Organization", "name": "Yclep", "logo": { "@type": "ImageObject", "url": "https://yclep.ai/logo.png" } },
        "description": processedHtml.replace(/<[^>]*>/g, '').substring(0, 160) + '...'
    };

    return (
        <>
            <SeoHead 
                title={analysisResult.title} 
                description={schema.description}
                type="article"
                publishedTime={article.created_at}
                schema={schema}
            />
            
            {/* Reading Progress Bar */}
            <div className="reading-progress-bar" style={{ width: `${readingProgress}%` }}></div>

            <div className="bg-white min-h-screen font-sans">
                {/* Hero Header */}
                <div className="bg-gray-50 border-b border-gray-100 pt-12 pb-16">
                    <div className="container mx-auto px-4 md:px-8 max-w-5xl text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold uppercase tracking-wide mb-6 border border-indigo-100">
                            {analysisResult.suggested_categories?.[0] || 'Review'}
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6 font-serif">
                            {analysisResult.title}
                        </h1>
                        
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 font-medium">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">AI</div>
                                <span>By <span className="text-gray-900">Yclep AI</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                <time dateTime={article.created_at}>
                                    {new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </time>
                            </div>
                            <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4" />
                                <span>{readingTime} min read</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="container mx-auto px-4 md:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        
                        {/* Left Sidebar: Share & Navigation (Desktop) */}
                        <aside className="hidden lg:block lg:col-span-3 space-y-8">
                            <div className="sticky top-24">
                                <div className="mb-8">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Share</p>
                                    <div className="flex gap-2">
                                        <button className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition-colors" aria-label="Share on Twitter">
                                            <i className="fab fa-twitter text-lg"></i>
                                        </button>
                                        <button className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-800 transition-colors" aria-label="Share on Facebook">
                                            <i className="fab fa-facebook text-lg"></i>
                                        </button>
                                        <button className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-500 transition-colors" aria-label="Share on LinkedIn">
                                            <i className="fab fa-linkedin text-lg"></i>
                                        </button>
                                        <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors" aria-label="Copy Link">
                                            <ShareIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <TableOfContents headers={headers} activeId={activeHeaderId} />
                            </div>
                        </aside>

                        {/* Center: Article Body */}
                        <article className="col-span-1 lg:col-span-6">
                            {/* New Key Takeaways Section - CoT Output */}
                            <KeyTakeaways points={analysisResult.key_takeaways} />

                            <div 
                                className="article-content prose-container"
                                dangerouslySetInnerHTML={{ __html: processedHtml }}
                            />
                            
                            <hr className="my-12 border-gray-200" />
                            <FeedbackWidget />
                        </article>

                        {/* Right Sidebar: Related Products */}
                        <aside className="col-span-1 lg:col-span-3 space-y-8">
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 sticky top-24">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <PhotoIcon className="w-4 h-4 text-indigo-500" />
                                    Mentioned Products
                                </h3>
                                {relatedProducts.length > 0 ? (
                                    <div className="space-y-2">
                                        {relatedProducts.map(product => (
                                            <RelatedProductItem key={product.id} product={product} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No specific products linked to this article.</p>
                                )}
                                
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Newsletter</h3>
                                    <p className="text-xs text-gray-500 mb-3">Get the latest AI-analyzed reviews straight to your inbox.</p>
                                    <div className="flex gap-2">
                                        <input type="email" placeholder="Email address" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                        <button className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">Join</button>
                                    </div>
                                </div>
                            </div>
                        </aside>

                    </div>
                </div>
            </div>
        </>
    );
};

export default ArticlePage;