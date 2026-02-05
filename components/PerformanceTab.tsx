
import React, { useState, useEffect } from 'react';
import type { Product, PerformanceMetrics } from '../types';
import ChartPieIcon from './icons/ChartPieIcon';

interface PerformanceTabProps {
    product: Product;
    onProductUpdate: (product: Product) => void;
}

const PerformanceTab: React.FC<PerformanceTabProps> = ({ product, onProductUpdate }) => {
    const [metrics, setMetrics] = useState<PerformanceMetrics>(
        product.performanceMetrics || { pageViews: 1000, conversionRate: 2.5 }
    );

    useEffect(() => {
        setMetrics(product.performanceMetrics || { pageViews: 1000, conversionRate: 2.5 });
    }, [product.id, product.performanceMetrics]);

    const handleSave = () => {
        onProductUpdate({ ...product, performanceMetrics: metrics });
        // In a real app, you'd show a notification here.
    };

    return (
        <div className="p-6 h-full flex items-center justify-center">
            <div className="w-full max-w-md bg-white p-8 rounded-lg border border-gray-200 shadow-md">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                    <ChartPieIcon className="w-6 h-6 mr-3 text-indigo-500" />
                    Performance Metrics
                </h3>
                <p className="text-gray-500 mb-6">
                    Input mock performance data to enable the A/B Testing Agent.
                </p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="pageViews" className="block text-sm font-medium text-gray-600">Monthly Page Views</label>
                        <input
                            type="number"
                            id="pageViews"
                            value={metrics.pageViews}
                            onChange={(e) => setMetrics(prev => ({ ...prev, pageViews: parseInt(e.target.value, 10) || 0 }))}
                            className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"
                        />
                    </div>
                    <div>
                        <label htmlFor="conversionRate" className="block text-sm font-medium text-gray-600">Conversion Rate (%)</label>
                        <input
                            type="number"
                            id="conversionRate"
                            step="0.1"
                            value={metrics.conversionRate}
                            onChange={(e) => setMetrics(prev => ({ ...prev, conversionRate: parseFloat(e.target.value) || 0 }))}
                            className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-md"
                >
                    Save Metrics
                </button>
            </div>
        </div>
    );
};

export default PerformanceTab;
