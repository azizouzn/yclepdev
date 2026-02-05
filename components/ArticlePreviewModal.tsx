

import React, { useState, useEffect, useRef } from 'react';
import type { Article } from '../types';
import XCircleIcon from './icons/XCircleIcon';
import ArticleImprovementAgentTab from './ArticleImprovementAgentTab';
import LinkIcon from './icons/LinkIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';

interface ArticlePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article;
  onGetSuggestions: (article: Article) => Promise<void>;
  onEnhanceArticle: (article: Article, feedback: string) => Promise<void>;
  onEnhanceArticleWithAllSuggestions: (article: Article) => Promise<void>;
  onRunAutolink: (contentId: number, contentType: 'article' | 'guide') => Promise<void>;
}

const ArticlePreviewModal: React.FC<ArticlePreviewModalProps> = ({ isOpen, onClose, article, onGetSuggestions, onEnhanceArticle, onEnhanceArticleWithAllSuggestions, onRunAutolink }) => {
  const [activeTab, setActiveTab] = useState('preview');
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (article.suggestionsLoading) {
      return;
    }

    if (Array.isArray(article.enhancementSuggestions)) {
      if (article.enhancementSuggestions.length > 0) {
        setActiveTab('improvements');
      } else {
        setActiveTab('preview');
      }
    }
  }, [article.enhancementSuggestions, article.suggestionsLoading]);
  
  // Accessibility: Focus trap and initial focus
  useEffect(() => {
    if (!isOpen) return;

    const modalElement = modalRef.current;
    if (!modalElement) return;

    const focusableElements = modalElement.querySelectorAll<HTMLElement>('button');
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
        }
    }, 100);

    return () => {
        clearTimeout(timer);
        modalElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);


  if (!isOpen) return null;

  const analysis = article.analysisResult;
  const isLinking = article.activeTask?.agent === 'InternalLinkingAgent';

  const TabButton: React.FC<{ tabName: string; label: string }> = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tabName
          ? 'bg-indigo-600 text-white'
          : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
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
        aria-labelledby="article-preview-title"
      >
        <header className="p-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 id="article-preview-title" className="text-xl font-bold text-gray-900">{analysis?.title || article.title}</h2>
            <p className="text-sm text-gray-500">/ Article Tools</p>
          </div>
          <button onClick={onClose} className="close-button text-gray-400 hover:text-gray-800" aria-label="Close">
            <XCircleIcon className="w-8 h-8" />
          </button>
        </header>

        <div className="flex-grow flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex space-x-2">
                    <TabButton tabName="preview" label="Content Preview" />
                    <TabButton tabName="improvements" label="Improvement Agent" />
                </div>
                <button
                    onClick={() => onRunAutolink(article.id, 'article')}
                    disabled={!!article.activeTask}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                    title="Automatically find and insert links to your published product reviews."
                >
                    {isLinking ? (
                        <>
                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            <span>Linking...</span>
                        </>
                    ) : (
                         <>
                            <LinkIcon className="w-5 h-5" />
                            <span>Auto-Link Content</span>
                        </>
                    )}
                </button>
            </div>
          
            <div className="flex-grow overflow-y-auto bg-gray-100">
                {activeTab === 'preview' && (
                    <iframe
                        key={analysis?.html_content} // Force re-render on change
                        srcDoc={analysis?.html_content || '<p>Content not available.</p>'}
                        title="Article Preview"
                        className="w-full h-full border-0"
                        sandbox="allow-scripts"
                    />
                )}
                {activeTab === 'improvements' && (
                    <ArticleImprovementAgentTab
                        article={article}
                        onGetSuggestions={onGetSuggestions}
                        onEnhanceArticle={onEnhanceArticle}
                        onEnhanceArticleWithAllSuggestions={onEnhanceArticleWithAllSuggestions}
                    />
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePreviewModal;