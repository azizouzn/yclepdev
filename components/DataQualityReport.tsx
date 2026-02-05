import React from 'react';
import type { DataQualityMetrics } from '../types';

interface DataQualityReportProps {
  metrics: DataQualityMetrics;
}

const Gauge: React.FC<{ label: string; value: number; max: number; isLowerBetter?: boolean }> = ({ label, value, max, isLowerBetter = false }) => {
    const percentage = (value / max) * 100;
    const getBarColor = () => {
        const score = isLowerBetter ? 100 - percentage : percentage;
        if (score >= 80) return 'bg-green-500';
        if (score >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-500">{label}</span>
                <span className="text-sm font-semibold text-gray-900">{value.toFixed(isLowerBetter ? 2 : 0)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className={`${getBarColor()} h-2.5 rounded-full`} style={{ width: `${percentage}%`, transition: 'width 0.5s ease-in-out' }}></div>
            </div>
        </div>
    );
};

const DataQualityReport: React.FC<DataQualityReportProps> = ({ metrics }) => {
  return (
    <div className="space-y-3">
        <Gauge label="Overall Quality Score" value={metrics.overall_score} max={100} />
        <div className="pt-2 mt-2 border-t border-gray-200 space-y-3">
            {metrics.breakdown && Object.entries(metrics.breakdown).map(([key, value]) => (
                 <Gauge key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={value} max={100} />
            ))}
        </div>
    </div>
  );
};

export default DataQualityReport;