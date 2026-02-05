import React from 'react';
import type { CompetitorAnalysis, SeoMetadata, AnalysisResult } from '../types';
import CodeBracketIcon from './icons/CodeBracketIcon';
import GlobeAltIcon from './icons/GlobeAltIcon';
import { useNotification } from '../contexts/NotificationContext';
import SparklesIcon from './icons/SparklesIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import LightBulbIcon from './icons/LightBulbIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import CompetitiveMatrix from './CompetitiveMatrix';
import LinkIcon from './icons/LinkIcon';

interface CompetitorReportProps {
  competitorAnalysis: CompetitorAnalysis;
  seoMetadata: SeoMetadata;
  internalLinkSuggestions: AnalysisResult['internalLinkSuggestions'];
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
    <section className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-indigo-500 mr-3">{icon}</span>
            {title}
        </h3>
        {children}
    </section>
);

const CompetitorReport: React.FC<CompetitorReportProps> = ({ competitorAnalysis, seoMetadata, internalLinkSuggestions }) => {
    const { showNotification } = useNotification();
    
    const copyToClipboard = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            showNotification(`${label} copied to clipboard!`, 'success');
        }).catch(err => {
            showNotification(`Failed to copy ${label}.`, 'error');
            console.error('Failed to copy text: ', err)
        });
    };

    return (
        <div className="space-y-8 text-gray-600">
            
             {competitorAnalysis?.competitive_positioning && (
                <InfoCard title="Competitive Landscape" icon={<GlobeAltIcon className="w-6 h-6" />}>
                    <CompetitiveMatrix positioning={competitorAnalysis.competitive_positioning} />
                </InfoCard>
            )}

            {competitorAnalysis?.market_gaps && (
                <InfoCard title="Strategic Market Gaps" icon={<LightBulbIcon className="w-6 h-6" />}>
                    <p className="text-sm italic bg-indigo-50 p-4 rounded-md border-l-4 border-indigo-500">
                        {competitorAnalysis.market_gaps}
                    </p>
                </InfoCard>
            )}

            <InfoCard title="Bing & Copilot Optimization" icon={<SparklesIcon className="w-6 h-6" />}>
                 <div className="space-y-6">
                    <div>
                        <h4 className="text-md font-semibold text-gray-800 mb-2">Copilot Answer Summary</h4>
                        <p className="text-xs text-gray-500 mb-2">A concise, fact-dense summary designed to be quoted directly by Bing Chat (Copilot).</p>
                        <div className="bg-gray-50 p-4 rounded-md border-l-4 border-indigo-500 relative">
                            <p className="text-sm italic">{seoMetadata?.ai_citation_summary ?? 'N/A'}</p>
                            <button onClick={() => copyToClipboard(seoMetadata?.ai_citation_summary ?? '', 'Copilot Summary')} className="absolute top-2 right-2 p-1.5 bg-gray-200 hover:bg-gray-300 rounded-md" title="Copy Summary">
                                <ClipboardIcon className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                    </div>
                     <div>
                        <h4 className="text-md font-semibold text-gray-800 mb-2">Bing Q&A Optimization</h4>
                         <p className="text-xs text-gray-500 mb-2">Targets Bing's Q&A rich snippets and conversational queries.</p>
                        <div className="space-y-3">
                            {(seoMetadata?.faq_section ?? []).map((faq, index) => (
                                <details key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                                    <summary className="font-semibold text-gray-700 cursor-pointer">{faq.question}</summary>
                                    <p className="mt-2 text-gray-600">{faq.answer}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-md font-semibold text-gray-800 mb-2">Bing Visual Search Data Points</h4>
                         <p className="text-xs text-gray-500 mb-2">Specific specs that power Bing's comparison cards.</p>
                        <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                            {(seoMetadata?.data_points ?? []).map((point, index) => <li key={index}>{point}</li>)}
                        </ul>
                    </div>
                 </div>
            </InfoCard>

            <InfoCard title="Bing SEO Strategy" icon={<CodeBracketIcon className="w-6 h-6" />}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">SEO Title (Exact Match Focus)</label>
                        <div className="flex items-center mt-1">
                            <input type="text" readOnly value={seoMetadata?.title ?? ''} className="flex-grow bg-gray-100 border border-gray-300 rounded-l-md shadow-sm py-2 px-3 text-gray-900 sm:text-sm" />
                            <button onClick={() => copyToClipboard(seoMetadata?.title ?? '', 'SEO Title')} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-r-md text-sm font-medium text-gray-700">Copy</button>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-500">Meta Description</label>
                        <div className="flex items-start mt-1">
                             <textarea readOnly rows={3} value={seoMetadata?.meta_description ?? ''} className="flex-grow bg-gray-100 border border-gray-300 rounded-l-md shadow-sm py-2 px-3 text-gray-900 sm:text-sm resize-none" />
                             <button onClick={() => copyToClipboard(seoMetadata?.meta_description ?? '', 'Meta Description')} className="px-3 py-2 h-full bg-gray-200 hover:bg-gray-300 rounded-r-md text-sm font-medium self-stretch text-gray-700">Copy</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                            <h4 className="text-md font-semibold text-gray-800 mb-2">Primary Keywords</h4>
                            <div className="flex flex-wrap gap-2">
                                {(seoMetadata?.primary_keywords ?? []).map((keyword, index) => (
                                    <span key={index} className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1.5 rounded-full">
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-md font-semibold text-gray-800 mb-2">Secondary Keywords</h4>
                            <div className="flex flex-wrap gap-2">
                                {(seoMetadata?.secondary_keywords ?? []).map((keyword, index) => (
                                    <span key={index} className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1.5 rounded-full">
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                     <div>
                        <h4 className="text-md font-semibold text-gray-800 mb-2">Schema Analysis (Critical for Bing)</h4>
                        <p className="bg-gray-50 p-3 rounded-md border text-sm">{seoMetadata?.schema_analysis ?? 'No schema analysis available.'}</p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-gray-200">
                        <h4 className="text-md font-semibold text-gray-800 mb-2">Title Variations</h4>
                        <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                            {(seoMetadata?.titleVariations ?? []).map((title, index) => <li key={index}>{title}</li>)}
                        </ul>
                    </div>
                    <div className="pt-4 mt-4 border-t border-gray-200">
                        <h4 className="text-md font-semibold text-gray-800 mb-2">JSON-LD Structured Data</h4>
                        <div className="bg-gray-800 p-4 rounded-md relative">
                            <pre className="text-xs text-gray-200 whitespace-pre-wrap overflow-auto max-h-48">{seoMetadata?.jsonLd ?? '{}'}</pre>
                            <button onClick={() => copyToClipboard(seoMetadata?.jsonLd ?? '', 'JSON-LD')} className="absolute top-2 right-2 p-1.5 bg-gray-600 hover:bg-gray-700 rounded-md" title="Copy JSON-LD">
                                <ClipboardIcon className="w-4 h-4 text-gray-200" />
                            </button>
                        </div>
                    </div>
                </div>
            </InfoCard>

             <InfoCard title="Internal Linking Strategy" icon={<LinkIcon className="w-6 h-6" />}>
                <p className="text-sm text-gray-500 mb-4">AI-suggested internal links to build topical authority and guide users (Bing deeply crawls site structure).</p>
                <div className="space-y-3">
                    {(internalLinkSuggestions ?? []).map((link, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                            <div className="flex items-center justify-between">
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 hover:underline text-sm">{link.anchor}</a>
                                <p className="text-xs text-gray-400">{link.url}</p>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 italic">Reason: {link.reason}</p>
                        </div>
                    ))}
                </div>
            </InfoCard>

            <InfoCard title="Bing Competitor Analysis" icon={<GlobeAltIcon className="w-6 h-6" />}>
                <div className="space-y-6">
                    <div>
                        <h4 className="text-md font-semibold text-gray-800 mb-2">AI Strategy Summary</h4>
                        <p className="bg-gray-50 p-4 rounded-md border-l-4 border-indigo-500 text-sm">{competitorAnalysis?.strategy_summary ?? 'No strategy summary available.'}</p>
                    </div>
                    <div>
                        <h4 className="text-md font-semibold text-gray-800 mb-3">Top Competitors (Bing SERP)</h4>
                        <ul className="space-y-6">
                            {(competitorAnalysis?.top_competitors ?? []).map((competitor, index) => (
                                <li key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
                                    <div>
                                        <a href={competitor.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 hover:underline">{competitor.title}</a>
                                        <p className="text-xs text-gray-500 truncate mt-1">{competitor.url}</p>
                                    </div>
                                    
                                    <div className="border-t border-gray-200 pt-3">
                                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Content Strategy</h5>
                                        <p className="text-sm text-gray-600 italic">"{competitor.content_strategy}"</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center"><CheckCircleIcon className="w-4 h-4 mr-1.5 text-green-500"/>Strengths:</p>
                                            <ul className="list-disc list-inside text-sm space-y-1">
                                                {competitor.strengths.map((strength, sIndex) => <li key={sIndex}>{strength}</li>)}
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center"><XCircleIcon className="w-4 h-4 mr-1.5 text-red-500"/>Weaknesses:</p>
                                            <ul className="list-disc list-inside text-sm space-y-1">
                                                {competitor.weaknesses.map((weakness, wIndex) => <li key={wIndex}>{weakness}</li>)}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-3">
                                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Psychological Tactics</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {competitor.visitor_engagement_techniques.map((tech, tIndex) => (
                                                <span key={tIndex} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">{tech}</span>
                                            ))}
                                            {competitor.persuasion_tactics.map((tactic, tIndex) => (
                                                <span key={tIndex} className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full">{tactic}</span>
                                            ))}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </InfoCard>
        </div>
    );
};

export default CompetitorReport;