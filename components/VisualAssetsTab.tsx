


import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import PhotoIcon from './icons/PhotoIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';

interface VisualAssetsTabProps {
    product: Product;
    onGenerateVisuals: (product: Product, prompt: string, type: 'featured' | 'banner') => Promise<void>;
}

const VisualAssetsTab: React.FC<VisualAssetsTabProps> = ({ product, onGenerateVisuals }) => {
    const [prompt, setPrompt] = useState(`A professional featured image for a review of ${product.title}`);
    const [imageType, setImageType] = useState<'featured' | 'banner'>('featured');
    
    const existingImage = imageType === 'featured' ? product.visualAssets?.featuredImage : product.visualAssets?.bannerImage;
    const imagePrompts = product.visualAssets?.imagePrompts || [];

    useEffect(() => {
        // Reset prompt when product or type changes
        if (imageType === 'featured') {
            setPrompt(`A professional hero shot of the ${product.title}, white background, studio lighting.`);
        } else {
            setPrompt(`A lifestyle banner image showing the ${product.title} being used in a real-world scenario.`);
        }
    }, [product.title, imageType]);


    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        await onGenerateVisuals(product, prompt, imageType);
    };

    return (
        <div className="p-6 h-full flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl bg-white p-8 rounded-lg border border-gray-200 shadow-md">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                    <PhotoIcon className="w-6 h-6 mr-3 text-indigo-500" />
                    Visual Asset Agent (Imagen 4)
                </h3>
                <p className="text-gray-500 mb-6">
                    Generate unique, AI-powered visuals for your content.
                </p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="imageType" className="block text-sm font-medium text-gray-600">Image Type</label>
                        <select
                            id="imageType"
                            value={imageType}
                            onChange={(e) => setImageType(e.target.value as 'featured' | 'banner')}
                            className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"
                        >
                            <option value="featured">Featured Image (4:3)</option>
                            <option value="banner">Promotional Banner (16:9)</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-600">Image Prompt</label>
                        <textarea
                            id="prompt"
                            rows={3}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"
                        />
                    </div>
                </div>
                 {imagePrompts.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <h4 className="text-md font-semibold text-gray-700 mb-2">AI-Suggested Prompts</h4>
                        <div className="space-y-2">
                            {imagePrompts.map((p, i) => (
                                <div key={i} className="bg-gray-100 p-2 rounded-md flex items-center justify-between text-sm">
                                    <p className="text-gray-600 italic">"{p}"</p>
                                    <button onClick={() => setPrompt(p)} className="text-xs font-semibold text-indigo-600 hover:underline flex-shrink-0 ml-2">Use</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={product.visualsLoading}
                    className="w-full mt-6 flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-md disabled:bg-indigo-400"
                >
                    {product.visualsLoading ? <><ArrowPathIcon className="w-5 h-5 mr-2 animate-spin"/> Generating...</> : (existingImage ? 'Regenerate Image' : 'Generate Image')}
                </button>

                {(product.visualsLoading || existingImage) && (
                     <div className={`mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center ${imageType === 'featured' ? 'aspect-[4/3]' : 'aspect-video'}`}>
                        {product.visualsLoading && !existingImage && <ArrowPathIcon className="w-10 h-10 text-indigo-500 animate-spin" />}
                        {existingImage && <img src={existingImage} alt="Generated asset" className="rounded-md object-contain max-h-full" />}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisualAssetsTab;