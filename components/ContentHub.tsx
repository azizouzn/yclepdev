

import React, { useState, type FC, type SVGProps } from 'react';
import { updateContentStatus, createGuide, runAutolink } from '../services/mastermindService';
import type { Article, Guide } from '../types';
import { ContentStatus } from '../types';
import { useNotification } from '../contexts/NotificationContext';

import LightBulbIcon from './icons/LightBulbIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';
import SparklesIcon from './icons/SparklesIcon';
import NewspaperIcon from './icons/NewspaperIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import CloudArrowUpIcon from './icons/CloudArrowUpIcon';
import CloudArrowDownIcon from './icons/CloudArrowDownIcon';
import TrashIcon from './icons/TrashIcon';
import EyeIcon from './icons/EyeIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import { useData } from '../contexts/DataContext';
import GuideEditor from './GuideEditor';
import BookOpenIcon from './icons/BookOpenIcon';


interface ContentHubProps {
    onViewArticle: (article: Article) => void;
    onDeleteArticle: (article: Article) => void;
    onGenerateArticle: (topic: string) => Promise<{ taskId: string, contentId: number} | null>;
    onRunAutolink: (contentId: number, contentType: 'article' | 'guide') => Promise<void>;
}

type StatusConfig = {
    text: string;
    Icon: FC<SVGProps<SVGSVGElement>>;
    color: string;
    animate?: string;
};


const ContentHub: React.FC<ContentHubProps> = ({ onViewArticle, onDeleteArticle, onGenerateArticle, onRunAutolink }) => {
    const { articles, setArticles, guides, addGuide, updateGuide, removeGuide, products } = useData();
    const { showNotification } = useNotification();
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [generatingArticleTopic, setGeneratingArticleTopic] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('articles');
    const [editingGuide, setEditingGuide] = useState<Partial<Guide> | null>(null);


    const handleFindTrends = async () => {
        setIsLoadingSuggestions(true);
        try {
            // Mocking trend spotting as it's a strategic agent run from Strategy Hub
            await new Promise(res => setTimeout(res, 1500));
            const topics = [
                "The Impact of AI on Portable Gaming Consoles in 2024",
                "Comparative Analysis: Foldable Smartphones vs. Traditional Flagships",
                "The Future of Smart Home Connectivity: Is Matter Protocol Ready?",
            ];
            setSuggestions(topics);
            showNotification('Found new trending topics!', 'success');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Could not fetch trends.";
            showNotification(`Error: ${errorMessage}`, 'error');
            console.error("Trend spotting failed:", error);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const handleGenerate = async (topic: string) => {
        setGeneratingArticleTopic(topic);
        await onGenerateArticle(topic);
        setGeneratingArticleTopic(null);
    };
    
    const handleTogglePublish = async (content: Article | Guide) => {
        const isArticle = 'analysisResult' in content;
        const newStatus = content.status === ContentStatus.PUBLISHED ? ContentStatus.DRAFT : ContentStatus.PUBLISHED;
        try {
            const updatedContent = await updateContentStatus(content.id, newStatus);
             if (isArticle) {
                setArticles(prev => prev.map(a => a.id === content.id ? updatedContent as Article : a));
            } else {
                // FIX: Conversion of type 'Product | Article' to type 'Guide' may be a mistake. Added a type guard to ensure the updated content is a Guide before calling `updateGuide`.
                if (updatedContent && 'embedded_product_ids' in updatedContent) {
                    updateGuide(updatedContent as Guide);
                }
            }
            showNotification(`"${content.title}" has been ${newStatus === ContentStatus.PUBLISHED ? 'published' : 'reverted to draft'}.`, 'success');
        } catch(error) {
            const message = error instanceof Error ? error.message : "Failed to update status.";
            showNotification(message, 'error');
        }
    };
    
    const handleDeleteGuide = (guide: Guide) => {
        // This will trigger the confirmation modal in Dashboard.tsx
        // For now, let's just optimistically remove it. A more robust solution would involve a shared state.
        removeGuide(guide.id);
        showNotification(`Guide "${guide.title}" deleted.`, 'success');
    }

    const AgentCard: React.FC = () => (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                    <LightBulbIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">Content Strategist Agent</h3>
                    <p className="text-sm text-gray-500">Discover and create high-quality, SEO-optimized content.</p>
                </div>
            </div>
            <button
                onClick={handleFindTrends}
                disabled={isLoadingSuggestions}
                className="w-full mt-4 flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_theme(colors.indigo.500/50%)] disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
                {isLoadingSuggestions ? (
                    <>
                        <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                        Searching for Trends...
                    </>
                ) : (
                    'Find Trending Topics'
                )}
            </button>
        </div>
    );
    
    const SuggestionItem: React.FC<{ topic: string }> = ({ topic }) => {
        const isGenerating = generatingArticleTopic === topic;
        return (
            <div className="bg-gray-50 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-200">
                <p className="flex-grow font-medium text-gray-700 text-left">{topic}</p>
                <button
                    onClick={() => handleGenerate(topic)}
                    disabled={isGenerating}
                    className="flex-shrink-0 w-full sm:w-auto flex justify-center items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors disabled:bg-green-400"
                >
                    {isGenerating ? (
                        <>
                            <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                         <>
                            <SparklesIcon className="w-4 h-4 mr-2" />
                            Write Article
                        </>
                    )}
                </button>
            </div>
        );
    };

    const statusConfig: Record<ContentStatus, StatusConfig> = {
        [ContentStatus.DRAFT]: { text: 'Draft', Icon: NewspaperIcon, color: 'text-gray-700 bg-gray-200' },
        [ContentStatus.GENERATING]: { text: 'Generating...', Icon: ArrowPathIcon, color: 'text-indigo-700 bg-indigo-100', animate: 'animate-spin' },
        [ContentStatus.PUBLISHED]: { text: 'Published', Icon: CheckCircleIcon, color: 'text-green-700 bg-green-100' },
        [ContentStatus.FAILED]: { text: 'Failed', Icon: XCircleIcon, color: 'text-red-700 bg-red-100' },
        [ContentStatus.PENDING]: { text: 'Pending', Icon: LightBulbIcon, color: 'text-gray-700 bg-gray-200' },
        [ContentStatus.ANALYZING]: { text: 'Analyzing', Icon: ArrowPathIcon, color: 'text-yellow-700 bg-yellow-100', animate: 'animate-spin' },
        [ContentStatus.COMPLETED]: { text: 'Completed', Icon: CheckCircleIcon, color: 'text-blue-700 bg-blue-100' },
        [ContentStatus.STALE]: { text: 'Stale', Icon: ExclamationTriangleIcon, color: 'text-orange-700 bg-orange-100' },
        // FIX: Add missing 'UPDATING' status to satisfy the Record<ContentStatus, ...> type.
        [ContentStatus.UPDATING]: { text: 'Updating...', Icon: ArrowPathIcon, color: 'text-blue-700 bg-blue-100', animate: 'animate-spin' },
    };

    const ArticleItem: React.FC<{ article: Article }> = ({ article }) => {
        const config = statusConfig[article.status];
        const canView = article.status === ContentStatus.DRAFT || article.status === ContentStatus.PUBLISHED;

        return (
             <div className="bg-white p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-gray-200 hover:border-indigo-400 transition-colors">
                <div className="flex-grow">
                    <p className="font-semibold text-gray-900">{article.analysisResult?.title || article.title}</p>
                    <p className="text-xs text-gray-500">Created: {new Date(article.created_at).toLocaleString()}</p>
                </div>
                 <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                     <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center justify-center min-w-[100px] ${config.color}`}>
                        <config.Icon className={`w-4 h-4 mr-1.5 ${config.animate || ''}`} />
                        {config.text}
                     </span>
                     <div className="flex items-center gap-2">
                        {canView && (
                            <button onClick={() => onViewArticle(article)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-md" title="View"><EyeIcon className="w-5 h-5"/></button>
                        )}
                        {article.status === ContentStatus.DRAFT && (
                            <button onClick={() => handleTogglePublish(article)} className="p-2 text-green-600 hover:bg-green-100 rounded-md" title="Publish"><CloudArrowUpIcon className="w-5 h-5"/></button>
                        )}
                         {article.status === ContentStatus.PUBLISHED && (
                            <button onClick={() => handleTogglePublish(article)} className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-md" title="Unpublish"><CloudArrowDownIcon className="w-5 h-5" /></button>
                        )}
                        <button onClick={() => onDeleteArticle(article)} className="p-2 text-red-600 hover:bg-red-100 rounded-md" title="Delete"><TrashIcon className="w-5 h-5" /></button>
                     </div>
                 </div>
            </div>
        )
    };
    
    const GuideItem: React.FC<{ guide: Guide }> = ({ guide }) => {
        const config = statusConfig[guide.status];
        return (
             <div className="bg-white p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-gray-200 hover:border-indigo-400 transition-colors">
                <div className="flex-grow">
                    <p className="font-semibold text-gray-900">{guide.title}</p>
                    <p className="text-xs text-gray-500">Created: {new Date(guide.created_at).toLocaleString()}</p>
                </div>
                 <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                     <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center justify-center min-w-[100px] ${config.color}`}>
                        <config.Icon className={`w-4 h-4 mr-1.5 ${config.animate || ''}`} />
                        {config.text}
                     </span>
                     <div className="flex items-center gap-2">
                        <button onClick={() => setEditingGuide(guide)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-md" title="Edit"><EyeIcon className="w-5 h-5"/></button>
                        {guide.status === ContentStatus.DRAFT && (
                            <button onClick={() => handleTogglePublish(guide)} className="p-2 text-green-600 hover:bg-green-100 rounded-md" title="Publish"><CloudArrowUpIcon className="w-5 h-5"/></button>
                        )}
                         {guide.status === ContentStatus.PUBLISHED && (
                            <button onClick={() => handleTogglePublish(guide)} className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-md" title="Unpublish"><CloudArrowDownIcon className="w-5 h-5" /></button>
                        )}
                        <button onClick={() => handleDeleteGuide(guide)} className="p-2 text-red-600 hover:bg-red-100 rounded-md" title="Delete"><TrashIcon className="w-5 h-5" /></button>
                     </div>
                 </div>
            </div>
        )
    };


    if (editingGuide) {
        return <GuideEditor 
            guide={editingGuide}
            onClose={() => setEditingGuide(null)}
            products={products.filter(p => p.status === ContentStatus.PUBLISHED)}
            onRunAutolink={onRunAutolink}
        />
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Content Tools</h3>
                    <div className="border-b border-gray-200 mb-4">
                        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                            <button onClick={() => setActiveTab('articles')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'articles' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                Article Generator
                            </button>
                            <button onClick={() => setActiveTab('guides')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'guides' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                Guide Builder
                            </button>
                        </nav>
                    </div>

                    {activeTab === 'articles' ? <AgentCard /> : (
                        <div>
                             <p className="text-sm text-gray-500 mb-4">Create in-depth buying guides that embed your existing product reviews to boost authority and conversions.</p>
                             <button onClick={() => setEditingGuide({})} className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-md">
                                 Create New Guide
                             </button>
                        </div>
                    )}
                </div>

                {activeTab === 'articles' && suggestions.length > 0 && (
                     <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">Generated Topics</h3>
                        <div className="space-y-3">
                            {suggestions.map(topic => <SuggestionItem key={topic} topic={topic} />)}
                        </div>
                    </div>
                )}
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                        {activeTab === 'articles' ? <NewspaperIcon className="w-6 h-6 mr-3 text-gray-600" /> : <BookOpenIcon className="w-6 h-6 mr-3 text-gray-600" />}
                        {activeTab === 'articles' ? 'Generated Articles' : 'Published Guides'}
                    </h3>
                 </div>
                 {activeTab === 'articles' ? (
                     articles.length > 0 ? (
                        <div className="p-4 space-y-3">
                            {articles.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(article => <ArticleItem key={article.id > 0 ? article.id : article.tempId} article={article} />)}
                        </div>
                     ) : (
                        <div className="text-center p-12 text-gray-500">
                            <NewspaperIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <h4 className="text-lg font-semibold text-gray-600">No Articles Yet</h4>
                            <p className="text-sm">Use the Content Strategist Agent to discover topics and generate new articles.</p>
                        </div>
                     )
                 ) : (
                    guides.length > 0 ? (
                        <div className="p-4 space-y-3">
                            {guides.map(guide => <GuideItem key={guide.id} guide={guide} />)}
                        </div>
                    ) : (
                        <div className="text-center p-12 text-gray-500">
                            <BookOpenIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <h4 className="text-lg font-semibold text-gray-600">No Guides Yet</h4>
                            <p className="text-sm">Use the Guide Builder to create your first buying guide.</p>
                        </div>
                    )
                 )}
            </div>
        </div>
    );
};

export default ContentHub;