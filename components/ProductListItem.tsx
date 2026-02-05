
import React from 'react';
import type { Product, ConfirmedAction } from '../types';
import { ContentStatus } from '../types';
import EyeIcon from './icons/EyeIcon';
import TrashIcon from './icons/TrashIcon';
import CloudArrowUpIcon from './icons/CloudArrowUpIcon';
import CloudArrowDownIcon from './icons/CloudArrowDownIcon';
import PlayCircleIcon from './icons/PlayCircleIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';
import SparklesIcon from './icons/SparklesIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import VideoCameraIcon from './icons/VideoCameraIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';

interface ProductListItemProps {
  product: Product;
  onViewResults: () => void;
  onDelete: () => void;
  onConfirmAction: (action: ConfirmedAction) => void;
  onGetSuggestions: () => Promise<void>;
  onGenerateVideoScript: () => Promise<void>;
}

// Tabler-style status colors
const statusConfig = {
    [ContentStatus.PENDING]: { text: 'Pending', color: 'text-gray-600', dot: 'bg-gray-400' },
    [ContentStatus.ANALYZING]: { text: 'Analyzing', color: 'text-blue-600', dot: 'bg-blue-500 animate-pulse' },
    [ContentStatus.COMPLETED]: { text: 'Completed', color: 'text-green-600', dot: 'bg-green-500' },
    [ContentStatus.FAILED]: { text: 'Failed', color: 'text-red-600', dot: 'bg-red-500' },
    [ContentStatus.PUBLISHED]: { text: 'Published', color: 'text-teal-600', dot: 'bg-teal-500' },
    [ContentStatus.STALE]: { text: 'Stale', color: 'text-orange-600', dot: 'bg-orange-500' },
    [ContentStatus.DRAFT]: { text: 'Draft', color: 'text-gray-500', dot: 'bg-gray-300' },
    [ContentStatus.GENERATING]: { text: 'Generating', color: 'text-indigo-600', dot: 'bg-indigo-500 animate-pulse' },
    [ContentStatus.UPDATING]: { text: 'Updating', color: 'text-blue-600', dot: 'bg-blue-500 animate-pulse' },
};

const ProductListItem: React.FC<ProductListItemProps> = ({ product, onViewResults, onDelete, onConfirmAction, onGetSuggestions, onGenerateVideoScript }) => {
  const config = statusConfig[product.status] || statusConfig[ContentStatus.PENDING];
  const isAnalyzed = product.status === ContentStatus.COMPLETED || product.status === ContentStatus.PUBLISHED || product.status === ContentStatus.STALE;
  const isUpdateAvailable = !!product.newAnalysis;
  const isAnyActionLoading = product.suggestionsLoading || product.scriptLoading;

  const ActionButton: React.FC<{ onClick?: () => void; icon: React.ReactNode; label: string; className?: string, disabled?: boolean, isLoading?: boolean }> = ({ onClick, icon, label, className = '', disabled = false, isLoading = false }) => (
    <button
      onClick={onClick}
      title={label}
      disabled={disabled || isAnyActionLoading}
      className={`btn btn-ghost btn-sm p-2 ${className} disabled:opacity-50`}
    >
      {isLoading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : icon}
    </button>
  );

  return (
    <div className={`group bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-0 ${isUpdateAvailable ? 'bg-yellow-50/50' : ''}`}>
        <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-4">
            
            {/* Status Indicator (Tabler Dot Style) */}
            <div className="flex items-center min-w-[120px] flex-shrink-0">
                 <span className={`w-2.5 h-2.5 rounded-full mr-2 ${config.dot}`}></span>
                 <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
            </div>

            {/* Main Content */}
            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">{product.title}</p>
                    {product.isEnhanced && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            Enhanced
                        </span>
                    )}
                    {isUpdateAvailable && (
                         <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            <ExclamationTriangleIcon className="w-3 h-3 mr-1"/> Update
                        </span>
                    )}
                </div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {product.affiliate_url}
                </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                 {product.status === ContentStatus.PENDING && (
                    <span className="text-xs text-gray-400 italic mr-2">Waiting...</span>
                )}

                {isAnalyzed && !isUpdateAvailable && (
                    <>
                        <ActionButton 
                            icon={<SparklesIcon className="w-4 h-4" />} 
                            label="Suggestions" 
                            className="hover:text-primary"
                            onClick={onGetSuggestions}
                            isLoading={product.suggestionsLoading}
                        />
                        <ActionButton
                            icon={<VideoCameraIcon className="w-4 h-4" />} 
                            label="Video Script" 
                            className="hover:text-purple-600"
                            onClick={onGenerateVideoScript}
                            isLoading={product.scriptLoading}
                        />
                        <ActionButton 
                            onClick={onViewResults} 
                            icon={<EyeIcon className="w-4 h-4" />} 
                            label="View" 
                            className="hover:text-blue-600"
                        />
                        {product.status === ContentStatus.PUBLISHED || product.status === ContentStatus.STALE ? (
                            <ActionButton 
                                onClick={() => onConfirmAction('UNPUBLISH')} 
                                icon={<CloudArrowDownIcon className="w-4 h-4" />} 
                                label="Unpublish" 
                                className="hover:text-orange-500"
                            />
                        ) : (
                            <ActionButton 
                                onClick={() => onConfirmAction('PUBLISH')} 
                                icon={<CloudArrowUpIcon className="w-4 h-4" />} 
                                label="Publish" 
                                className="hover:text-green-600"
                            />
                        )}
                    </>
                )}

                {isUpdateAvailable && (
                     <button
                        onClick={onViewResults}
                        className="btn btn-primary py-1 px-3 text-xs h-auto"
                    >
                        Review Update
                    </button>
                )}

                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                
                <ActionButton 
                    onClick={onDelete} 
                    icon={<TrashIcon className="w-4 h-4" />} 
                    label="Delete" 
                    className="hover:text-red-600"
                />
            </div>
        </div>
    </div>
  );
};

export default React.memo(ProductListItem);
