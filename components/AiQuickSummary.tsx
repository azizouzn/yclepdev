import React, { useState, useEffect } from 'react';
import SparklesIcon from './icons/SparklesIcon';

interface AiQuickSummaryProps {
  summary: string;
}

const AiQuickSummary: React.FC<AiQuickSummaryProps> = ({ summary }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        setDisplayedText('');
        
        const loadingTimer = setTimeout(() => {
            setIsLoading(false);
            let i = 0;
            const typingTimer = setInterval(() => {
                if (i < summary.length) {
                    setDisplayedText(prev => prev + summary.charAt(i));
                    i++;
                } else {
                    clearInterval(typingTimer);
                }
            }, 20); // Adjust typing speed here
             return () => clearInterval(typingTimer);
        }, 1500); // Initial "thinking" delay

        return () => clearTimeout(loadingTimer);

    }, [summary]);

    return (
        <div 
            id="ai-quick-summary" 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-md p-6 bg-gray-800 border-2 border-indigo-500 rounded-lg shadow-2xl text-white page-transition"
        >
            <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                <SparklesIcon className="w-5 h-5 text-indigo-400" />
                AI Quick Summary
            </h3>
            <div className="min-h-[80px] text-sm text-gray-300">
                {isLoading ? (
                     <div className="flex items-center gap-2 text-gray-400">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        <span className="ml-2">Analyzing...</span>
                    </div>
                ) : (
                    <p>{displayedText}<span className="inline-block w-2 h-4 bg-indigo-400 animate-pulse ml-1"></span></p>
                )}
            </div>
        </div>
    );
};

export default AiQuickSummary;
