import React from 'react';
import type { DistributionAssets } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import ShareIcon from './icons/ShareIcon';
import EnvelopeIcon from './icons/EnvelopeIcon';
import ClipboardIcon from './icons/ClipboardIcon';

interface MarketingAssetsTabProps {
    assets: DistributionAssets;
}

const MarketingAssetsTab: React.FC<MarketingAssetsTabProps> = ({ assets }) => {
    const { showNotification } = useNotification();

    const copyToClipboard = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            showNotification(`${label} copied to clipboard!`, 'success');
        }).catch(err => {
            showNotification(`Failed to copy ${label}.`, 'error');
            console.error('Failed to copy text: ', err);
        });
    };

    const AssetCard: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-indigo-500 mr-3">{icon}</span>
                {title}
            </h3>
            {children}
        </div>
    );
    
    return (
        <div className="space-y-8 text-gray-600">
            <AssetCard title="Social Media Posts" icon={<ShareIcon className="w-6 h-6" />}>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Twitter</h4>
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 relative">
                            <p className="text-sm whitespace-pre-wrap">{assets.social_media.twitter}</p>
                            <button 
                                onClick={() => copyToClipboard(assets.social_media.twitter, 'Twitter post')}
                                className="absolute top-2 right-2 p-1.5 bg-gray-200 hover:bg-gray-300 rounded-md"
                                title="Copy Twitter post"
                            >
                                <ClipboardIcon className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Facebook</h4>
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 relative">
                            <p className="text-sm whitespace-pre-wrap">{assets.social_media.facebook}</p>
                             <button 
                                onClick={() => copyToClipboard(assets.social_media.facebook, 'Facebook post')}
                                className="absolute top-2 right-2 p-1.5 bg-gray-200 hover:bg-gray-300 rounded-md"
                                title="Copy Facebook post"
                            >
                                <ClipboardIcon className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </AssetCard>

            <AssetCard title="Email Newsletter Snippet" icon={<EnvelopeIcon className="w-6 h-6" />}>
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Subject</label>
                        <div className="flex items-center mt-1">
                            <input type="text" readOnly value={assets.email.subject} className="flex-grow bg-gray-100 border border-gray-300 rounded-l-md shadow-sm py-2 px-3 text-gray-900 sm:text-sm" />
                            <button onClick={() => copyToClipboard(assets.email.subject, 'Email subject')} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-r-md text-sm font-medium text-gray-700">
                                <ClipboardIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-500">Body</label>
                        <div className="flex items-start mt-1">
                             <textarea readOnly rows={5} value={assets.email.body} className="flex-grow bg-gray-100 border border-gray-300 rounded-l-md shadow-sm py-2 px-3 text-gray-900 sm:text-sm resize-none" />
                             <button onClick={() => copyToClipboard(assets.email.body, 'Email body')} className="px-3 py-2 h-full bg-gray-200 hover:bg-gray-300 rounded-r-md text-sm font-medium self-stretch text-gray-700">
                                <ClipboardIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </AssetCard>
        </div>
    );
};

export default MarketingAssetsTab;
