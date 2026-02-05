
import React from 'react';
import type { Article } from '../../types';
import SparklesIcon from './icons/SparklesIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';

interface ArticleImprovementAgentTabProps {
    article: Article;
    onGetSuggestions: (article: Article) => Promise<void>;
    onEnhanceArticle: (article: Article, feedback: string) => Promise<void>;
    onEnhanceArticleWithAllSuggestions: (article: Article) => Promise<void>;
}

const ArticleImprovementAgentTab: React.FC<ArticleImprovementAgentTabProps> = ({ article, onGetSuggestions, onEnhanceArticle, onEnhanceArticleWithAllSuggestions }) => {
    
    const handleApplySuggestion = async (suggestion: string) => {
        await onEnhanceArticle(article, suggestion);
    };

    const hasSuggestions = article.enhancementSuggestions && article.enhancementSuggestions.length > 0;

    return (
        <div className="p-6 h-full">
            <div className="bg-white p-6 rounded-lg border border-gray-200 h-full flex flex-col">
                <div className="flex-shrink-0">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                        <SparklesIcon className="w-6 h-6 mr-3 text-indigo-500" />
                        Improvement Agent
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Suggest actionable improvements for SEO, readability, and engagement.
                    </p>
                </div>

                {!hasSuggestions && !article.suggestionsLoading && (
                    <div className="flex-grow flex items-center justify-center">
                        <div className="text-center">
                            <button
                                onClick={() => onGetSuggestions(article)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_theme(colors.indigo.500/50%)]"
                            >
                                Analyze for Improvements
                            </button>
                        </div>
                    </div>
                )}
                
                {article.suggestionsLoading && (
                    <div className="flex-grow flex items-center justify-center">
                        <div className="text-center text-indigo-500">
                             <ArrowPathIcon className="w-12 h-12 mx-auto animate-spin mb-4" />
                             <p className="font-semibold">Agent is analyzing...</p>
                        </div>
                    </div>
                )}

                {hasSuggestions && (
                    <div className="flex-grow flex flex-col space-y-4 overflow-hidden">
                        <div className="flex-grow space-y-4 overflow-y-auto pr-2">
                            <h4 className="text-lg font-semibold text-gray-800">Suggestions:</h4>
                            {article.enhancementSuggestions.map((suggestion, index) => (
                               <div key={index} className="bg-gray-50 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-gray-200">
                                   <p className="flex-grow text-gray-700">{suggestion}</p>
                                   <button 
                                       onClick={() => handleApplySuggestion(suggestion)}
                                       disabled={article.enhancementLoading}
                                       className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                   >
                                       {article.enhancementLoading ? 'Applying...' : 'Apply'}
                                   </button>
                               </div>
                            ))}
                        </div>
                         <div className="flex-shrink-0 pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => onEnhanceArticleWithAllSuggestions(article)}
                                disabled={article.enhancementLoading || article.suggestionsLoading}
                                className="w-full sm:flex-1 flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-indigo-400"
                              >
                                  {article.enhancementLoading ? <><ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />Applying All...</> : 'Apply All Suggestions'}
                              </button>
                            <button
                                onClick={() => onGetSuggestions(article)}
                                disabled={article.suggestionsLoading || article.enhancementLoading}
                                className="w-full sm:flex-1 flex justify-center items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md disabled:bg-gray-400"
                            >
                                {article.suggestionsLoading ? <><ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />Getting more...</> : 'Get New Suggestions'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticleImprovementAgentTab;
