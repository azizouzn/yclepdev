
import React from 'react';
import { ContentStatus } from '../types';
import RocketLaunchIcon from './icons/RocketLaunchIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import { useData } from '../contexts/DataContext';
import XCircleIcon from './icons/XCircleIcon';
import CloudArrowUpIcon from './icons/CloudArrowUpIcon';

// Tabler-inspired Sparkline SVG
const Sparkline: React.FC<{ color: string; data: number[] }> = ({ color, data }) => {
    const height = 40;
    const width = 100;
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (d * height);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width="100%" height="40" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="opacity-20">
            <path d={`M0 ${height} L${points} L${width} ${height} Z`} fill={color} stroke="none" />
            <path d={`M${points}`} fill="none" stroke={color} strokeWidth="2" />
        </svg>
    );
};

const AnalyticsSummary: React.FC = () => {
  const { products } = useData();
  const totalProducts = products.length;
  const publishedCount = products.filter(p => p.status === ContentStatus.PUBLISHED).length;
  const failedCount = products.filter(p => p.status === ContentStatus.FAILED).length;
  const completedCount = products.filter(p => p.status === ContentStatus.COMPLETED).length;

  const successRate = totalProducts > 0 ? ((publishedCount + completedCount) / totalProducts) * 100 : 0;

  // Mock data for sparklines (in a real app, this would be historical data)
  const trendData = [0.2, 0.4, 0.3, 0.6, 0.5, 0.8, 0.7, 0.9, 0.8, 1];
  
  const StatCard: React.FC<{ 
      title: string; 
      value: string; 
      trend?: string; 
      color: string; 
      icon: React.ReactNode 
  }> = ({ title, value, trend, color, icon }) => (
    <div className="card relative overflow-hidden bg-white">
      <div className="card-content p-5">
          <div className="flex items-center justify-between">
              <div>
                   <div className="text-subheader text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">{title}</div>
                   <div className="text-3xl font-bold text-foreground">{value}</div>
              </div>
              <div className={`p-2 rounded-md ${color} bg-opacity-10`}>
                 {/* Clone icon to inject class names if needed, or wrap */}
                 <span className={`${color.replace('bg-', 'text-')}`}>{icon}</span>
              </div>
          </div>
          {trend && (
              <div className="mt-3 flex items-center text-sm">
                  <span className="text-green-600 font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-trending-up mr-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 17l6 -6l4 4l8 -8" /><path d="M14 7l7 0l0 7" /></svg>
                      {trend}
                  </span>
                  <span className="text-muted-foreground ml-2">last 30 days</span>
              </div>
          )}
      </div>
      {/* Decorative sparkline at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-10">
          <Sparkline color="currentColor" data={trendData} />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
            title="Total Products" 
            value={totalProducts.toString()} 
            trend="+12%"
            color="bg-blue-500 text-blue-600" 
            icon={<RocketLaunchIcon className="w-6 h-6" />} 
        />
        <StatCard 
            title="Published" 
            value={publishedCount.toString()} 
            trend="+5%"
            color="bg-green-500 text-green-600" 
            icon={<CloudArrowUpIcon className="w-6 h-6" />} 
        />
        <StatCard 
            title="Success Rate" 
            value={`${successRate.toFixed(0)}%`} 
            color="bg-indigo-500 text-indigo-600" 
            icon={<CheckCircleIcon className="w-6 h-6" />} 
        />
        <StatCard 
            title="Failed Tasks" 
            value={failedCount.toString()} 
            color="bg-red-500 text-red-600" 
            icon={<XCircleIcon className="w-6 h-6" />} 
        />
    </div>
  );
};

export default AnalyticsSummary;
