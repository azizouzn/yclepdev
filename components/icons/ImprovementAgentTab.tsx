import React from 'react';
import type { Product, ImprovementAction } from '../../types';
import SparklesIcon from './SparklesIcon';
import CodeBracketIcon from './CodeBracketIcon';

interface ImprovementAgentTabProps {
    product: Product;
    onEnhanceProduct: (product: Product, feedback: string) => Promise<void>;
}

const ImprovementAgentTab: React.FC<ImprovementAgentTabProps> = ({ product, onEnhanceProduct }) => {
    
    const handleApplyAction = async (action: ImprovementAction) => {
        await onEnhanceProduct(product, action.action);
    };

    const improvementActions = product.analysisResult?.improvementActions || [];

    return (
        <div className="p-6 h-full">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 h-full flex flex-col">
                <div className="flex-shrink-0">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                        <SparklesIcon className="w-6 h-6 mr-3 text-indigo-500" />
                        Improvement Actions
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Prioritized, actionable improvements suggested by the AI to enhance this content's performance.
                    </p>
                </div>

                {improvementActions.length > 0 ? (
                    <div className="flex-grow space-y-4 overflow-y-auto">
                        {improvementActions.sort((a,b) => a.priority - b.priority).map((action, index) => (
                           <details key={index} className="bg-white p-4 rounded-lg border border-gray-200 group">
                                <summary className="flex items-center justify-between cursor-pointer">
                                   <p className="flex-grow text-gray-700">
                                       <span className="font-bold text-indigo-600 mr-2">Action {action.priority}:</span>
                                       {action.action}
                                   </p>
                                   <button 
                                       onClick={(e) => { e.preventDefault(); handleApplyAction(action); }}
                                       disabled={product.enhancementLoading}
                                       className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ml-4"
                                    >
                                       Apply
                                   </button>
                               </summary>
                               <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h5 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2 mb-2"><CodeBracketIcon className="w-4 h-4" /> Suggested Patch (Diff)</h5>
                                    <pre className="bg-gray-800 text-gray-200 text-xs p-3 rounded-md whitespace-pre-wrap">{action.patch}</pre>
                               </div>
                           </details>
                        ))}
                    </div>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-center text-gray-500">
                        <p>No specific improvement actions were generated for this analysis.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImprovementAgentTab;
