import React from 'react';
import type { ProductAnalysis } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import ArrowTopRightOnSquareIcon from './icons/ArrowTopRightOnSquareIcon';

interface ProductVerdictProps {
  analysis: ProductAnalysis;
}

const ProductVerdict: React.FC<ProductVerdictProps> = ({ analysis }) => {
  const confidenceConfig = {
      high: { color: 'bg-green-500', label: 'High Confidence' },
      medium: { color: 'bg-yellow-400', label: 'Medium Confidence' },
      low: { color: 'bg-orange-500', label: 'Low Confidence' },
  };

  const sourceTypeConfig: { [key: string]: string } = {
      official: 'bg-blue-100 text-blue-800',
      review_site: 'bg-purple-100 text-purple-800',
      forum: 'bg-gray-200 text-gray-800',
  };


  return (
    <div className="space-y-8 text-gray-700">
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Executive Summary</h3>
        <p className="bg-indigo-50 p-4 rounded-md border-l-4 border-indigo-500 text-lg font-medium">{analysis.executiveSummary}</p>
      </section>

      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Verdict</h3>
        <p className="bg-gray-100 p-4 rounded-md border-l-4 border-gray-500">{analysis.verdict}</p>
      </section>

      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Summary</h3>
        <p>{analysis.summary}</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold text-green-600 mb-3 flex items-center">
            <CheckCircleIcon className="w-6 h-6 mr-2" /> Pros
          </h3>
          <ul className="space-y-4">
            {analysis.pros.map((item, index) => (
                <li key={index} className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 mr-3 mt-0.5 text-green-500 flex-shrink-0" />
                    <div className="flex-grow">
                        <div className="flex items-center">
                            <span>{item.statement}</span>
                            <span 
                                className={`w-2.5 h-2.5 ml-2 rounded-full flex-shrink-0 ${confidenceConfig[item.confidence].color}`} 
                                title={confidenceConfig[item.confidence].label}>
                            </span>
                        </div>
                        {item.evidence.length > 0 && (
                            <a href={item.evidence[0].url} target="_blank" rel="noopener noreferrer" title={`Source: ${item.evidence[0].title}`} className="inline-flex items-center text-xs text-gray-500 hover:text-indigo-600 group mt-1.5">
                                <span className={`px-2 py-0.5 mr-2 rounded-full font-medium capitalize ${sourceTypeConfig[item.evidence[0].source_type]}`}>
                                    {item.evidence[0].source_type.replace('_', ' ')}
                                </span>
                                <span>Source</span>
                                <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
                            </a>
                        )}
                    </div>
                </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-red-600 mb-3 flex items-center">
            <XCircleIcon className="w-6 h-6 mr-2" /> Cons
          </h3>
          <ul className="space-y-4">
            {analysis.cons.map((item, index) => (
                <li key={index} className="flex items-start">
                    <XCircleIcon className="w-5 h-5 mr-3 mt-0.5 text-red-500 flex-shrink-0" />
                    <div className="flex-grow">
                         <div className="flex items-center">
                            <span>{item.statement}</span>
                            <span 
                                className={`w-2.5 h-2.5 ml-2 rounded-full flex-shrink-0 ${confidenceConfig[item.confidence].color}`} 
                                title={confidenceConfig[item.confidence].label}>
                            </span>
                        </div>
                        {item.evidence.length > 0 && (
                             <a href={item.evidence[0].url} target="_blank" rel="noopener noreferrer" title={`Source: ${item.evidence[0].title}`} className="inline-flex items-center text-xs text-gray-500 hover:text-indigo-600 group mt-1.5">
                                <span className={`px-2 py-0.5 mr-2 rounded-full font-medium capitalize ${sourceTypeConfig[item.evidence[0].source_type]}`}>
                                    {item.evidence[0].source_type.replace('_', ' ')}
                                </span>
                                <span>Source</span>
                                <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
                            </a>
                        )}
                    </div>
                </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default ProductVerdict;