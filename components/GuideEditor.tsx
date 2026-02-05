import React, { useState } from 'react';
import type { Guide, Product } from '../types';
import { useData } from '../contexts/DataContext';
import { createGuide, updateGuide } from '../services/mastermindService';
import { useNotification } from '../contexts/NotificationContext';
import XCircleIcon from './icons/XCircleIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';
import LinkIcon from './icons/LinkIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';

interface GuideEditorProps {
    guide: Partial<Guide>;
    onClose: () => void;
    products: Product[];
    onRunAutolink: (contentId: number, contentType: 'article' | 'guide') => Promise<void>;
}

const GuideEditor: React.FC<GuideEditorProps> = ({ guide, onClose, products, onRunAutolink }) => {
    const { guides, addGuide, updateGuide: updateDataContext } = useData();
    const { showNotification } = useNotification();
    const [title, setTitle] = useState(guide.title || '');
    const [content, setContent] = useState(guide.html_content || '');
    const [embeddedIds, setEmbeddedIds] = useState(guide.embedded_product_ids || []);
    const [isSaving, setIsSaving] = useState(false);

    const fullGuide = guide.id ? guides.find(g => g.id === guide.id) : null;
    const isLinking = fullGuide?.activeTask?.agent === 'InternalLinkingAgent';

    const handleEmbedProduct = (productId: number) => {
        setContent(prev => `${prev}\n[EMBED_PRODUCT:${productId}]`);
        if (!embeddedIds.includes(productId)) {
            setEmbeddedIds(prev => [...prev, productId]);
        }
    };
    
    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            showNotification('Title and content are required.', 'error');
            return;
        }
        setIsSaving(true);
        try {
            if (guide.id) { // Update existing
                const updated = await updateGuide(guide.id, { title, html_content: content, embedded_product_ids: embeddedIds });
                updateDataContext(updated);
                showNotification('Guide updated successfully!', 'success');
            } else { // Create new
                const newGuide = await createGuide(title, content, embeddedIds);
                addGuide(newGuide);
                showNotification('Guide created successfully!', 'success');
            }
            onClose();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save guide.';
            showNotification(message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{guide.id ? 'Edit Guide' : 'Create New Guide'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircleIcon className="w-7 h-7" /></button>
                </div>
                <div className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Guide Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full text-lg font-bold border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <textarea 
                        rows={20}
                        placeholder="Write your guide content here. Use the product list to embed review cards."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
                 <div className="mt-6 flex justify-between items-center">
                     {guide.id && (
                        <button
                            onClick={() => onRunAutolink(guide.id!, 'guide')}
                            disabled={!!fullGuide?.activeTask}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                        >
                            {isLinking ? (
                                <>
                                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                    <span>Linking...</span>
                                </>
                            ) : (
                                <>
                                    <LinkIcon className="w-5 h-5" />
                                    <span>Auto-Link Content</span>
                                </>
                            )}
                        </button>
                    )}
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md disabled:bg-indigo-400"
                    >
                        {isSaving ? 'Saving...' : 'Save Guide'}
                    </button>
                </div>
            </div>
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">Embeddable Products</h4>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                    {products.map(p => (
                        <div key={p.id} className="bg-gray-50 p-3 rounded-md flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-700">{p.title}</p>
                            <button onClick={() => handleEmbedProduct(p.id)} title="Embed Product">
                                <PlusCircleIcon className="w-6 h-6 text-indigo-500 hover:text-indigo-700"/>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GuideEditor;