
import React from 'react';
import type { Opportunity } from '../types';
import SparklesIcon from './icons/SparklesIcon';

interface OpportunityCardProps {
    opportunity: Opportunity;
    onAnalyze: (topic: string, url: string) => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, onAnalyze }) => {
    const competitionColors = {
        low: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-red-100 text-red-800',
    };
    
    const potentialColor = opportunity.marketPotential > 90 ? 'text-green-500' : opportunity.marketPotential > 80 ? 'text-blue-500' : 'text-gray-600';

    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="flex-grow">
                    <p className="font-semibold text-gray-800">{opportunity.topic}</p>
                    <p className="text-xs text-gray-500">Source: {opportunity.source}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center">
                        <p className={`font-bold text-lg ${potentialColor}`}>{opportunity.marketPotential}</p>
                        <p className="text-xs text-gray-500">Potential</p>
                    </div>
                     <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${competitionColors[opportunity.competitionLevel]}`}>
                        {opportunity.competitionLevel}
                    </span>
                </div>
            </div>
            <button
                onClick={() => onAnalyze(opportunity.topic, 'https://example.com/product-url')}
                className="w-full mt-3 text-sm flex justify-center items-center bg-white hover:bg-gray-100 text-indigo-600 font-semibold py-2 px-4 rounded-md border border-gray-300"
            >
                <SparklesIcon className="w-4 h-4 mr-2" />
                Analyze This Opportunity
            </button>
        </div>
    );
};

export default OpportunityCard;