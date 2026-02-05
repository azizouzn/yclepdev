

import React, { useState } from 'react';
import type { Opportunity, Product } from '../types';
import { findOpportunities, monitorContentHealth, generateSeoStrategy } from '../services/mastermindService';
import { useNotification } from '../contexts/NotificationContext';
import LightBulbIcon from './icons/LightBulbIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';
import OpportunityCard from './OpportunityCard';
import StaleContentCard from './StaleContentCard';
import { ContentStatus } from '../types';
import { useData } from '../contexts/DataContext';
import AcademicCapIcon from './icons/AcademicCapIcon';


interface StrategyHubProps {
  opportunities: Opportunity[];
  setOpportunities: React.Dispatch<React.SetStateAction<Opportunity[]>>;
  onAnalyzeOpportunity: (topic: string, url: string) => void;
  onRefreshProduct: (product: Product) => void;
  activeTasks: Record<string, boolean>;
  onAddTask: (taskId: string) => void;
}

const StrategyHub: React.FC<StrategyHubProps> = ({ opportunities, setOpportunities, onAnalyzeOpportunity, onRefreshProduct, activeTasks, onAddTask }) => {
    const { products, setProducts } = useData();
    const { showNotification } = useNotification();
    const [isFindingOpportunities, setIsFindingOpportunities] = useState(false);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [targetKeyword, setTargetKeyword] = useState('');
    const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);

    const handleFindOpportunities = async () => {
        setIsFindingOpportunities(true);
        try {
            const { task_id } = await findOpportunities();
            onAddTask(task_id);
            showNotification('Opportunity Hunter agent dispatched!', 'info');
        } catch (error) {
            showNotification('Failed to start Opportunity Hunter.', 'error');
        } finally {
            setIsFindingOpportunities(false);
        }
    };

    const handleMonitorContent = async () => {
        setIsMonitoring(true);
        try {
            const { task_id } = await monitorContentHealth();
            onAddTask(task_id);
            showNotification('Market Sentinel agent dispatched!', 'info');
        } catch (error) {
            showNotification('Failed to start Market Sentinel.', 'error');
        } finally {
            setIsMonitoring(false);
        }
    };

    const handleGenerateStrategy = async () => {
        if (!targetKeyword.trim()) {
            showNotification('Please enter a target keyword.', 'info');
            return;
        }
        setIsGeneratingStrategy(true);
        try {
            const { task_id } = await generateSeoStrategy(targetKeyword);
            onAddTask(task_id);
            showNotification('SEO Strategist agent dispatched!', 'info');
        } catch (error) {
            showNotification('Failed to start SEO Strategist.', 'error');
        } finally {
            setIsGeneratingStrategy(false);
            setTargetKeyword('');
        }
    };
    
    const staleProducts = products.filter(p => p.status === ContentStatus.STALE);
    
    const isTaskRunning = isFindingOpportunities || isMonitoring || isGeneratingStrategy || Object.values(activeTasks).some(status => status);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Proactive Agents</h3>
                    <div className="space-y-4">
                        <button
                            onClick={handleFindOpportunities}
                            disabled={isTaskRunning}
                            className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-md disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                            {isFindingOpportunities || activeTasks[Object.keys(activeTasks).find(k => k.startsWith('task_opp_')) ?? ''] ? <><ArrowPathIcon className="w-5 h-5 mr-2 animate-spin"/> Hunting...</> : 'Run Opportunity Hunter'}
                        </button>
                         <button
                            onClick={handleMonitorContent}
                            disabled={isTaskRunning}
                            className="w-full flex justify-center items-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2.5 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isMonitoring || activeTasks[Object.keys(activeTasks).find(k => k.startsWith('task_sntl_')) ?? ''] ? <><ArrowPathIcon className="w-5 h-5 mr-2 animate-spin"/> Monitoring...</> : 'Run Market Sentinel'}
                        </button>
                    </div>
                </div>

                 <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-3"><AcademicCapIcon className="w-6 h-6 text-indigo-500" />Advanced SEO Strategist</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Generate a comprehensive content strategy and competitive analysis report for any keyword.
                    </p>
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={targetKeyword}
                            onChange={(e) => setTargetKeyword(e.target.value)}
                            placeholder="e.g., 'best budget drone'"
                            className="block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <button
                            onClick={handleGenerateStrategy}
                            disabled={isTaskRunning}
                            className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-md disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                            {isGeneratingStrategy ? <><ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" /> Generating...</> : 'Generate SEO Strategy'}
                        </button>
                    </div>
                </div>

                {opportunities.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                         <h3 className="text-xl font-semibold text-gray-900 mb-4">New Opportunities</h3>
                         <div className="space-y-3">
                            {opportunities.map(opp => (
                                <OpportunityCard key={opp.id} opportunity={opp} onAnalyze={onAnalyzeOpportunity} />
                            ))}
                         </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Content Health Monitor</h3>
                {staleProducts.length > 0 ? (
                    <div className="space-y-3">
                        {staleProducts.map(product => (
                            <StaleContentCard
                                key={product.id}
                                product={product}
                                onRefresh={() => onRefreshProduct(product)}
                                onDismiss={() => setProducts(products.map(p => p.id === product.id ? {...p, status: ContentStatus.PUBLISHED, staleReason: undefined } : p))}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 text-gray-500">
                        <LightBulbIcon className="w-12 h-12 mx-auto mb-4 text-gray-400"/>
                        <h4 className="font-semibold">No issues found.</h4>
                        <p className="text-sm">Run the Market Sentinel to check for content that may need updates.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StrategyHub;