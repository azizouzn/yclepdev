import React from 'react';

interface AnalysisMetricsProps {
  category: string;
}

const MetricItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="bg-gray-100 p-3 rounded-lg">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
);

const AnalysisMetrics: React.FC<AnalysisMetricsProps> = ({ category }) => {
  return (
    <div>
        <h4 className="text-md font-semibold text-gray-700 mb-2">Metrics</h4>
        <div className="space-y-2">
            <MetricItem label="AI-Detected Category" value={category} />
        </div>
    </div>
  );
};

export default AnalysisMetrics;