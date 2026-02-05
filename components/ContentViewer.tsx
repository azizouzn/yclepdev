
import React, { useEffect, useRef, lazy, Suspense } from 'react';
import type { Product, Article, Guide } from '../types';
import XCircleIcon from './icons/XCircleIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';

const ProductView = lazy(() => import('./InteractiveProductReviewPage'));
const ArticleView = lazy(() => import('./ArticlePage'));
const GuideView = lazy(() => import('./GuidePage'));

interface ContentViewerProps {
    content: Product | Article | Guide;
    onClose: () => void;
    allProducts: Product[];
}

const ContentViewer: React.FC<ContentViewerProps> = ({ content, onClose, allProducts }) => {
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        
        const timer = setTimeout(() => closeButtonRef.current?.focus(), 100);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(timer);
        };
    }, [onClose]);

    const renderContent = () => {
        if (!content) return null;

        if ('affiliate_url' in content) {
            return <ProductView product={content as Product} />;
        }
        if ('analysisResult' in content && content.analysisResult && 'suggested_categories' in content.analysisResult) {
            return <ArticleView article={content as Article} allProducts={allProducts} />;
        }
        if ('embedded_product_ids' in content) {
            return <GuideView guide={content as Guide} allProducts={allProducts} />;
        }
        return <p>Unsupported content type.</p>;
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" role="dialog" aria-modal="true">
            <div className="fixed inset-0" onClick={onClose}></div>
            <div
                ref={panelRef}
                className="fixed top-0 right-0 bottom-0 w-full max-w-5xl bg-white shadow-2xl content-viewer-slide-in"
            >
                <div className="h-full flex flex-col">
                    <header className="flex-shrink-0 p-4 flex items-center justify-between border-b border-gray-200 bg-white sticky top-0 z-10">
                        <div className="text-lg font-bold text-gray-900 truncate pr-4">
                           {'title' in content ? content.title : 'Content'}
                        </div>
                        <button
                            ref={closeButtonRef}
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-900 transition-colors"
                            aria-label="Close content viewer"
                        >
                            <XCircleIcon className="w-8 h-8" />
                        </button>
                    </header>
                    <div className="flex-grow overflow-y-auto">
                        <Suspense fallback={
                            <div className="flex items-center justify-center h-full text-indigo-500">
                                <ArrowPathIcon className="w-10 h-10 animate-spin" />
                            </div>
                        }>
                            {renderContent()}
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentViewer;
