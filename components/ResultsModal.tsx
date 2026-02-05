



import React, { useState, useEffect, useRef } from 'react';
import type { Product, AnalysisResult, NewsItem } from '../types';
import AnalysisMetrics from './AnalysisMetrics';
import ProductVerdict from './ProductVerdict';
import ReviewScorecard from './icons/ReviewScorecard';
import CompetitorReport from './CompetitorReport';
import DataQualityReport from './DataQualityReport';
import XCircleIcon from './icons/XCircleIcon';
import WrenchScrewdriverIcon from './icons/WrenchScrewdriverIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import ImprovementAgentTab from './icons/ImprovementAgentTab';
import MarketingAssetsTab from './MarketingAssetsTab';
import PerformanceTab from './PerformanceTab';
import VisualAssetsTab from './VisualAssetsTab';
import MegaphoneIcon from './icons/MegaphoneIcon';
import PhotoIcon from './icons/PhotoIcon';
import ChartPieIcon from './icons/ChartPieIcon';
import GlobeAltIcon from './icons/GlobeAltIcon';
import ShareIcon from './icons/ShareIcon';
import SparklesIcon from './icons/SparklesIcon';
import EyeIcon from './icons/EyeIcon';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import VideoCameraIcon from './icons/VideoCameraIcon';
import VideoScriptTab from './VideoScriptTab';
import DocumentMagnifyingGlassIcon from './icons/DocumentMagnifyingGlassIcon';
import NewspaperIcon from './icons/NewspaperIcon';


const UpdateReviewTab: React.FC<{ product: Product; onAccept: () => void; onDiscard: () => void }> = ({ product, onAccept, onDiscard }) => {
    // Basic markdown renderer
    const renderMarkdown = (text: string) => {
        return text
            .split('\n')
            .map((line, i) => {
                if (line.startsWith('###')) return <h3 key={i} className="text-lg font-bold mt-4 mb-2">{line.replace('###', '')}</h3>;
                if (line.startsWith('##')) return <h2 key={i} className="text-xl font-bold mt-6 mb-2">{line.replace('##', '')}</h2>;
                if (line.startsWith('#')) return <h1 key={i} className="text-2xl font-bold mt-8 mb-4">{line.replace('#', '')}</h1>;
                if (line.startsWith('*')) return <li key={i}>{line.replace('*', '')}</li>;
                if (line.trim() === '') return <br key={i} />;
                return <p key={i}>{line}</p>;
            });
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Review Update Summary</h3>
            <div className="flex-grow bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-y-auto prose prose-sm max-w-none">
                {renderMarkdown(product.diffReport || 'No comparison available.')}
            </div>
            <div className="flex-shrink-0 pt-4 mt-4 flex justify-end gap-3">
                <button onClick={onDiscard} className="btn btn-secondary">Discard Changes</button>
                <button onClick={onAccept} className="btn btn-primary bg-green-600 hover:bg-green-700">Accept & Update Content</button>
            </div>
        </div>
    );
};

const NewsFeedTab: React.FC<{ newsItems?: NewsItem[] }> = ({ newsItems }) => {
    if (!newsItems || newsItems.length === 0) {
        return (
            <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                <NewspaperIcon className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">No Recent News Found</h3>
                <p className="text-sm text-gray-500 mt-2">The News Aggregator agent did not find any recent articles for this product.</p>
            </div>
        );
    }
    
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch {
            return dateString;
        }
    }

    return (
        <div className="p-6 h-full overflow-y-auto">
            <div className="space-y-4">
                {newsItems.map((item, index) => (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" key={index} className="block bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-400 hover:shadow-sm transition-all">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-gray-800 pr-4">{item.title}</h4>
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full whitespace-nowrap">{item.source}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{item.summary}</p>
                        <p className="text-xs text-gray-400 mt-3">{formatDate(item.published_at)}</p>
                    </a>
                ))}
            </div>
        </div>
    );
};


interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onProductUpdate: (product: Product) => void;
  onEnhanceProduct: (product: Product, feedback: string) => Promise<void>;
  onGetSuggestions: (product: Product) => Promise<void>;
  onGenerateAbTest: (product: Product) => Promise<void>;
  onGenerateVisuals: (product: Product, prompt: string, type: 'featured' | 'banner') => Promise<void>;
  onGenerateVideoScript: (product: Product) => Promise<void>;
  onAcceptUpdate: (product: Product) => void;
  onDiscardUpdate: (product: Product) => void;
  initialTab?: string;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ 
    isOpen, onClose, product, onProductUpdate, 
    onEnhanceProduct, onGetSuggestions, onGenerateAbTest, 
    onGenerateVisuals, onGenerateVideoScript, 
    onAcceptUpdate, onDiscardUpdate,
    initialTab 
}) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'review');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const isUpdateAvailable = !!product.newAnalysis;
  
  // Reset feedback and tab when product changes or initialTab is provided
  useEffect(() => {
    if (isUpdateAvailable) {
        setActiveTab('update');
    } else {
        setFeedback('');
        setActiveTab(initialTab || 'review');
    }
  }, [product.id, initialTab, isUpdateAvailable]);
  
  // Accessibility: Focus trap and initial focus
  useEffect(() => {
    if (!isOpen) return;
    
    const modalElement = modalRef.current;
    if (!modalElement) return;

    const focusableElements = modalElement.querySelectorAll<HTMLElement>(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key !== 'Tab') return;

        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    };

    modalElement.addEventListener('keydown', handleKeyDown);

    const timer = setTimeout(() => {
        const closeButton = modalElement.querySelector('button.close-button');
        if (closeButton instanceof HTMLElement) {
            closeButton.focus();
        } else {
            firstElement?.focus();
        }
    }, 100);

    return () => {
        clearTimeout(timer);
        modalElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);


  if (!isOpen || !product.analysisResult) return null;

  const analysis = product.analysisResult;

  const handleEnhanceSubmit = async () => {
    if (!feedback.trim()) return;
    setIsSubmitting(true);
    await onEnhanceProduct(product, feedback);
    setIsSubmitting(false);
    setFeedback('');
  };
  
  const TabButton: React.FC<{ tabName: string; label: string, icon: React.ReactNode }> = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tabName
          ? 'bg-indigo-600 text-white'
          : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
        {icon}
        <span>{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        ref={modalRef}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="results-modal-title"
      >
        <header className="p-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 id="results-modal-title" className="text-xl font-bold text-gray-900">{product.title}</h2>
            {product.isEnhanced && <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Enhanced</span>}
            <p className="text-sm text-gray-500">/ Analysis Results</p>
          </div>
          <button onClick={onClose} className="close-button text-gray-400 hover:text-gray-800" aria-label="Close">
            <XCircleIcon className="w-8 h-8" />
          </button>
        </header>

        <div className="flex-grow flex overflow-hidden">
          {/* Sidebar */}
          <aside className="w-1/4 bg-gray-50 p-4 border-r border-gray-200 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
            <div className="space-y-4">
              <ReviewScorecard score={analysis.product_analysis?.overall_score ?? 0} />
              <AnalysisMetrics 
                category={analysis.product_analysis?.category ?? 'N/A'}
              />

              {!isUpdateAvailable && (
                <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                        <WrenchScrewdriverIcon className="w-5 h-5 me-2 text-indigo-500" />
                        Manual Regeneration
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">Request specific changes to the generated landing page.</p>
                    <div className="space-y-2">
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={4}
                            className="block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="e.g., Change the theme to light mode."
                            disabled={isSubmitting || product.enhancementLoading}
                        />
                        <button
                            onClick={handleEnhanceSubmit}
                            disabled={!feedback.trim() || isSubmitting || product.enhancementLoading}
                            className="w-full flex justify-center items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-green-500 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting || product.enhancementLoading ? (
                                <>
                                    <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                                    Applying...
                                </>
                            ) : (
                                'Apply Manual Changes'
                            )}
                        </button>
                    </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="w-3/4 flex flex-col bg-white">
            <div className="p-4 border-b border-gray-200">
                <div className="flex flex-wrap gap-2">
                    {isUpdateAvailable && (
                      <TabButton tabName="update" label="Review Update" icon={<DocumentMagnifyingGlassIcon className="w-5 h-5" />}/>
                    )}
                    <TabButton tabName="review" label="AI Review" icon={<ClipboardDocumentListIcon className="w-5 h-5" />}/>
                    <TabButton tabName="competitors" label="Competitors & SEO" icon={<GlobeAltIcon className="w-5 h-5" />}/>
                    {analysis.news_feed && (
                        <TabButton tabName="news" label="Market News" icon={<NewspaperIcon className="w-5 h-5" />}/>
                    )}
                    {analysis.data_quality_metrics && (
                        <TabButton tabName="quality" label="Data Quality" icon={<ChartBarIcon className="w-5 h-5" />}/>
                    )}
                    {analysis.distribution_assets && (
                      <TabButton tabName="marketing" label="Marketing" icon={<ShareIcon className="w-5 h-5" />}/>
                    )}
                    <TabButton tabName="video_script" label="Video Script" icon={<VideoCameraIcon className="w-5 h-5" />}/>
                    <TabButton tabName="improvements" label="Improvements" icon={<SparklesIcon className="w-5 h-5" />}/>
                    <TabButton tabName="performance" label="Performance" icon={<ChartPieIcon className="w-5 h-5"/>}/>
                    <TabButton tabName="ab_tests" label="A/B Tests" icon={<MegaphoneIcon className="w-5 h-5"/>}/>
                    <TabButton tabName="visuals" label="Visuals" icon={<PhotoIcon className="w-5 h-5"/>}/>
                    <TabButton tabName="preview" label={isUpdateAvailable ? "Preview New Version" : "Preview"} icon={<EyeIcon className="w-5 h-5" />}/>
                </div>
            </div>
            <div className="flex-grow overflow-hidden bg-gray-100">
                {activeTab === 'update' && isUpdateAvailable && (
                    <UpdateReviewTab 
                        product={product} 
                        onAccept={() => onAcceptUpdate(product)}
                        onDiscard={() => onDiscardUpdate(product)}
                    />
                )}
                {activeTab === 'review' && analysis.product_analysis && (
                    <div className="p-6 overflow-y-auto h-full">
                        <ProductVerdict analysis={analysis.product_analysis} />
                    </div>
                )}
                {activeTab === 'competitors' && (
                    <div className="p-6 overflow-y-auto h-full">
                        <CompetitorReport
                            competitorAnalysis={analysis.competitor_analysis}
                            seoMetadata={analysis.seo_metadata}
                            internalLinkSuggestions={analysis.internalLinkSuggestions}
                        />
                    </div>
                )}
                {activeTab === 'news' && (
                    <NewsFeedTab newsItems={analysis.news_feed} />
                )}
                 {activeTab === 'quality' && analysis.data_quality_metrics && (
                    <div className="p-6 overflow-y-auto h-full flex items-center justify-center">
                        <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-md border border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                                <ChartBarIcon className="w-6 h-6 me-3 text-indigo-500" />
                                AI Data Quality Report
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                The Data Quality Agent analyzes the coherence, relevance, and consistency of the generated analysis to ensure its reliability.
                            </p>
                            <DataQualityReport metrics={analysis.data_quality_metrics} />
                        </div>
                    </div>
                )}
                {activeTab === 'marketing' && analysis.distribution_assets && (
                    <div className="p-6 overflow-y-auto h-full">
                        <MarketingAssetsTab assets={analysis.distribution_assets} />
                    </div>
                )}
                 {activeTab === 'video_script' && (
                    <VideoScriptTab product={product} onGenerate={onGenerateVideoScript} />
                )}
                {activeTab === 'improvements' && (
                    <div className="p-6 overflow-y-auto h-full">
                        <ImprovementAgentTab 
                          product={product}
                          onEnhanceProduct={onEnhanceProduct}
                        />
                    </div>
                )}
                {activeTab === 'performance' && (
                    <PerformanceTab product={product} onProductUpdate={onProductUpdate} />
                )}
                {activeTab === 'ab_tests' && (
                    <div className="p-6 h-full flex items-center justify-center">
                        <button onClick={() => onGenerateAbTest(product)} className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-md">
                            Generate A/B Test Suggestion
                        </button>
                    </div>
                )}
                {activeTab === 'visuals' && (
                    <VisualAssetsTab product={product} onGenerateVisuals={onGenerateVisuals} />
                )}
                {activeTab === 'preview' && (
                     <iframe
                        key={isUpdateAvailable ? 'new-preview' : product.analysisResult.final_output.html_content}
                        srcDoc={isUpdateAvailable ? (product.newAnalysis?.final_output?.html_content || 'Preview not available.') : (analysis.final_output?.html_content ?? '')}
                        title={`${product.title} Preview`}
                        className="w-full h-full border-0"
                    />
                )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;