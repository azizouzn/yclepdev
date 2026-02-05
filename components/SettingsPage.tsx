

import React, { useState, useEffect } from 'react';
import type { BrandPersona } from '../types';
import { getBrandPersona, updateBrandPersona } from '../services/mastermindService';
import { useNotification } from '../contexts/NotificationContext';
import Cog6ToothIcon from './icons/Cog6ToothIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ChevronUpDownIcon from './icons/ChevronUpDownIcon';
import ApiProviderManager from './ApiProviderManager';
import ServerStackIcon from './icons/ServerStackIcon';

const personaOptions: { value: BrandPersona; label: string; description: string }[] = [
    { value: 'friendly_and_helpful', label: 'Friendly & Helpful', description: 'Approachable and supportive, perfect for general consumer audiences.' },
    { value: 'witty_and_informal', label: 'Witty & Informal', description: 'Uses humor and casual language to engage a younger, tech-savvy audience.' },
    { value: 'expert_and_technical', label: 'Expert & Technical', description: 'Detailed, data-driven, and precise. Best for complex products and enthusiast audiences.' },
];

const SettingsPage: React.FC = () => {
    const { showNotification } = useNotification();
    const [persona, setPersona] = useState<BrandPersona>('friendly_and_helpful');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchPersona = async () => {
            setIsLoading(true);
            try {
                const response = await getBrandPersona();
                setPersona(response.persona);
            } catch (error) {
                showNotification('Failed to load brand persona.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPersona();
    }, [showNotification]);

    const handleSavePersona = async () => {
        setIsSaving(true);
        try {
            await updateBrandPersona(persona);
            showNotification('Brand persona updated successfully!', 'success');
        } catch (error) {
            showNotification('Failed to save brand persona.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading Settings...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <a href="/admin" className="inline-flex items-center gap-2 text-sm text-indigo-600 font-semibold hover:underline mb-6">
                    <ArrowLeftIcon className="w-5 h-5"/>
                    Back to Dashboard
                </a>
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-200">
                    <div className="flex items-center gap-4 mb-8">
                         <Cog6ToothIcon className="w-8 h-8 text-indigo-500"/>
                        <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
                    </div>
                    
                    <div className="space-y-8">
                        {/* Brand Persona Section */}
                        <div className="border border-gray-200 p-6 rounded-lg">
                            <h2 className="text-xl font-semibold text-gray-800">Brand Persona</h2>
                            <p className="text-sm text-gray-500 mt-1">Define the default tone and style for all AI-generated content to ensure brand consistency.</p>
                            
                            <div className="mt-4 relative">
                                <select
                                    id="brand-persona"
                                    value={persona}
                                    onChange={(e) => setPersona(e.target.value as BrandPersona)}
                                    className="block w-full appearance-none bg-white border border-gray-300 rounded-md shadow-sm py-3 pl-4 pr-10 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    {personaOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <ChevronUpDownIcon className="w-5 h-5"/>
                                </div>
                            </div>
                            <div className="mt-2 bg-gray-50 p-3 rounded-md text-sm text-gray-600 border border-gray-200">
                                {personaOptions.find(opt => opt.value === persona)?.description}
                            </div>
                            <div className="mt-4 flex justify-end">
                                 <button
                                    onClick={handleSavePersona}
                                    disabled={isSaving}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-indigo-400"
                                >
                                    {isSaving ? 'Saving...' : 'Save Persona'}
                                </button>
                            </div>
                        </div>

                        {/* AI Provider Configuration Section */}
                        <div className="border border-gray-200 p-6 rounded-lg">
                             <div className="flex items-start gap-4 mb-2">
                                 <ServerStackIcon className="w-6 h-6 text-gray-700 mt-1 flex-shrink-0"/>
                                 <div>
                                    <h2 className="text-xl font-semibold text-gray-800">AI Provider Configuration</h2>
                                    <p className="text-sm text-gray-500 mt-1">Manage and prioritize the AI services used by the platform. Drag to reorder priority (top is highest).</p>
                                 </div>
                             </div>
                            <ApiProviderManager />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;