import React, { useState, useEffect, useRef } from 'react';
import type { ApiProviderSettings } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import { useSettings } from '../contexts/SettingsContext';
import KeyIcon from './icons/KeyIcon';
import ChevronUpDownIcon from './icons/ChevronUpDownIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';

const ApiProviderManager: React.FC = () => {
    const { providers: providersWithStatus, isLoading } = useSettings();
    const [providers, setProviders] = useState<ApiProviderSettings[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const { showNotification } = useNotification();
    
    const draggedItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    useEffect(() => {
        if (!isLoading) {
             setProviders(providersWithStatus.map(({ isConfigured, ...rest }) => rest).sort((a,b) => a.priority - b.priority));
        }
    }, [providersWithStatus, isLoading]);

    const handleToggleActive = (providerName: string) => {
        setProviders(prev => prev.map(p => 
            p.provider_name === providerName ? { ...p, is_active: !p.is_active } : p
        ));
        setIsDirty(true);
    };

    const handleDragSort = () => {
        if (draggedItem.current === null || dragOverItem.current === null) return;
        
        const providersClone = [...providers];
        const draggedProvider = providersClone.splice(draggedItem.current, 1)[0];
        providersClone.splice(dragOverItem.current, 0, draggedProvider);
        
        const reorderedProviders = providersClone.map((p, index) => ({...p, priority: index + 1 }));
        setProviders(reorderedProviders);
        setIsDirty(true);

        draggedItem.current = null;
        dragOverItem.current = null;
    };
    
    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/settings/providers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(providers)
            });
            if (!response.ok) throw new Error('Failed to save settings');
            const updatedProviders = await response.json();
            setProviders(updatedProviders.sort((a: ApiProviderSettings, b: ApiProviderSettings) => a.priority - b.priority));
            setIsDirty(false);
            showNotification('AI Provider settings saved successfully!', 'success');
        } catch (error) {
            showNotification('Failed to save settings.', 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const ProviderLogo: React.FC<{ provider: string }> = ({ provider }) => {
        if (provider === 'gemini') {
            return <div title="Gemini" className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full" />;
        }
        return <div className="w-6 h-6 bg-gray-400 rounded-full" />;
    };

    if (isLoading) {
        return <div className="text-center p-4">Loading providers...</div>;
    }

    return (
        <div className="mt-4">
            <div className="space-y-3">
                {providers.map((provider, index) => {
                    const status = providersWithStatus.find(p => p.provider_name === provider.provider_name);
                    return (
                        <div
                            key={provider.provider_name}
                            draggable
                            onDragStart={() => (draggedItem.current = index)}
                            onDragEnter={() => (dragOverItem.current = index)}
                            onDragEnd={handleDragSort}
                            onDragOver={(e) => e.preventDefault()}
                            className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200 cursor-grab active:cursor-grabbing"
                        >
                            <ChevronUpDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <ProviderLogo provider={provider.provider_name} />
                            <div className="flex-grow">
                                <p className="font-semibold text-gray-800 capitalize">{provider.provider_name}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <KeyIcon className="w-3 h-3" />
                                    <span>{provider.api_key_env_var_name}</span>
                                </div>
                            </div>
                            
                            {status?.isConfigured ? (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    <CheckCircleIcon className="w-4 h-4"/> Configured
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                    <XCircleIcon className="w-4 h-4"/> Not Set
                                </span>
                            )}

                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={provider.is_active}
                                    onChange={() => handleToggleActive(provider.provider_name)}
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    );
                })}
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSaveChanges}
                    disabled={!isDirty || isSaving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md disabled:bg-indigo-400 disabled:opacity-70"
                >
                    {isSaving ? 'Saving...' : 'Save Provider Settings'}
                </button>
            </div>
        </div>
    );
};

export default ApiProviderManager;