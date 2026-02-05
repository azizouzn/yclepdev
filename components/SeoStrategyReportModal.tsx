import React, { useState, useRef, useEffect } from 'react';
import type { SeoStrategyReport } from '../types';
import XCircleIcon from './icons/XCircleIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import MagnifyingGlassPlusIcon from './icons/MagnifyingGlassPlusIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import BeakerIcon from './icons/BeakerIcon';

interface SeoStrategyReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: SeoStrategyReport;
}

const SeoStrategyReportModal: React.FC<SeoStrategyReportModalProps> = ({ isOpen, onClose, report }) => {
    const [activeTab, setActiveTab] = useState('keywords');
    const modalRef = useRef<HTMLDivElement>(null);
    
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
            firstElement?.focus();
        }, 100);

        return () => {
            clearTimeout(timer);
            modalElement.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;
    
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
                aria-labelledby="seo-report-title"
            >
                <header className="p-4 flex items-center justify-between border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <AcademicCapIcon className="w-8 h-8 text-indigo-500" />
                        <div>
                            <h2 id="seo-report-title" className="text-xl font-bold text-gray-900">Bing SEO Strategy Report</h2>
                            <p className="text-sm text-gray-500">For keyword: <span className="font-semibold text-indigo-600">"{report.targetKeyword}"</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800" aria-label="Close">
                        <XCircleIcon className="w-8 h-8" />
                    </button>
                </header>

                 <div className="flex-grow flex overflow-hidden">
                     {/* Sidebar */}
                    <aside className="w-1/4 bg-gray-50 p-4 border-r border-gray-200 overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Summary</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase">Target Keyword</p>
                                <p className="font-semibold text-gray-800">{report.targetKeyword}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase">Primary User Intent</p>
                                <p className="font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-md inline-block mt-1">{report.userIntent}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase">Semantic Terms</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {report.semanticTerms.slice(0, 10).map((term, i) => (
                                        <span key={i} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{term}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                     {/* Main Content */}
                    <main className="w-3/4 flex flex-col bg-white">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex flex-wrap gap-2">
                                <TabButton tabName="keywords" label="Bing Keyword Dive" icon={<MagnifyingGlassPlusIcon className="w-5 h-5" />} />
                                <TabButton tabName="blueprint" label="Content Blueprint" icon={<DocumentTextIcon className="w-5 h-5" />} />
                                <TabButton tabName="gaps" label="Gap Analysis" icon={<BeakerIcon className="w-5 h-5" />} />
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto bg-gray-100 p-6">
                            {activeTab === 'keywords' && (
                                <table className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Volume</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competition</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relevance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {report.keywordAnalysis.map(kw => (
                                            <tr key={kw.keyword}>
                                                <td className="px-6 py-4 font-medium text-gray-800">{kw.keyword}</td>
                                                <td className="px-6 py-4"><div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-500 h-2.5 rounded-full" style={{width: `${kw.volume}%`}}></div></div></td>
                                                <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${kw.competition === 'low' ? 'bg-green-100 text-green-800' : kw.competition === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{kw.competition}</span></td>
                                                <td className="px-6 py-4"><div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-indigo-500 h-2.5 rounded-full" style={{width: `${kw.relevance}%`}}></div></div></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            {activeTab === 'blueprint' && (
                                <div className="space-y-6">
                                    <div className="bg-white p-4 rounded-lg border">
                                        <h4 className="font-bold text-gray-800">Recommended Word Count</h4>
                                        <div className="flex items-baseline gap-4 mt-2">
                                            <p><span className="text-2xl font-bold">{report.contentStructureReport.recommendedWordCount.average}</span><span className="text-sm text-gray-500"> avg</span></p>
                                            <p><span className="text-lg font-semibold">{report.contentStructureReport.recommendedWordCount.min}</span><span className="text-xs text-gray-500"> min</span></p>
                                            <p><span className="text-lg font-semibold">{report.contentStructureReport.recommendedWordCount.max}</span><span className="text-xs text-gray-500"> max</span></p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border">
                                        <h4 className="font-bold text-gray-800 mb-2">Recommended Heading Structure</h4>
                                        <div className="text-sm space-y-2">
                                            <p className="font-semibold bg-gray-100 p-2 rounded">H1: {report.contentStructureReport.recommendedHeadingStructure.H1}</p>
                                            <div><strong className="text-gray-600">H2s:</strong><ul className="list-disc list-inside ml-2">{report.contentStructureReport.recommendedHeadingStructure.H2.map((h,i) => <li key={i}>{h}</li>)}</ul></div>
                                            <div><strong className="text-gray-600">H3s:</strong><ul className="list-disc list-inside ml-2">{report.contentStructureReport.recommendedHeadingStructure.H3.map((h,i) => <li key={i}>{h}</li>)}</ul></div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-white p-4 rounded-lg border"><h4 className="font-bold text-gray-800 mb-2">Must-Have Sections</h4><ul className="list-disc list-inside text-sm space-y-1">{report.contentStructureReport.mustHaveSections.map((s,i) => <li key={i}>{s}</li>)}</ul></div>
                                        <div className="bg-white p-4 rounded-lg border"><h4 className="font-bold text-gray-800 mb-2">Key Topics to Cover</h4><ul className="list-disc list-inside text-sm space-y-1">{report.contentStructureReport.keyTopics.map((t,i) => <li key={i}>{t}</li>)}</ul></div>
                                    </div>
                                </div>
                            )}
                             {activeTab === 'gaps' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                     <div className="bg-white p-4 rounded-lg border"><h4 className="font-bold text-gray-800 mb-2">Missing Keywords</h4><ul className="list-disc list-inside text-sm space-y-1">{report.competitiveGapAnalysis.missingKeywords.map((kw,i) => <li key={i}>{kw}</li>)}</ul></div>
                                     <div className="bg-white p-4 rounded-lg border"><h4 className="font-bold text-gray-800 mb-2">Underutilized Topics</h4><ul className="list-disc list-inside text-sm space-y-1">{report.competitiveGapAnalysis.underutilizedTopics.map((t,i) => <li key={i}>{t}</li>)}</ul></div>
                                     <div className="bg-white p-4 rounded-lg border"><h4 className="font-bold text-gray-800 mb-2">Unique Angle Suggestions</h4><ul className="list-disc list-inside text-sm space-y-1">{report.competitiveGapAnalysis.uniqueAngleSuggestions.map((a,i) => <li key={i}>{a}</li>)}</ul></div>
                                </div>
                            )}
                        </div>
                    </main>
                 </div>
            </div>
        </div>
    );
};

export default SeoStrategyReportModal;