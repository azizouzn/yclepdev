import React from 'react';
import TrendingUpIcon from './icons/TrendingUpIcon';
import ChatBubbleLeftRightIcon from './icons/ChatBubbleLeftRightIcon';
import LinkIcon from './icons/LinkIcon';
import CodeBracketIcon from './icons/CodeBracketIcon';
import Squares2x2Icon from './icons/Squares2x2Icon';

const AiVisibilityDashboard: React.FC = () => {
    // Mock data for demonstration
    const visibilityScore = 82;
    const aiMentions = 142;
    const citedPages = 35;
    const entityCoverage = 91;
    const schemaValidity = 98;

    const mentionsHistory = [45, 50, 65, 70, 95, 110, 142];
    const topCitedPages = [
        { url: '/site/product/1', title: 'AeroGlide X1 Drone Review', citations: 28 },
        { url: '/site/guides/1', title: 'The Ultimate Guide to Buying Your First Drone', citations: 15 },
        { url: '/site/product/2', title: 'NovaBook Pro 14" Review', citations: 12 },
    ];

    const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; iconBg: string }> = ({ title, value, icon, iconBg }) => (
        <div className="card flex flex-row items-center gap-4 p-4">
            <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg ${iconBg}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
        </div>
    );
    
    // Simple line chart component
    const LineChart: React.FC<{ data: number[] }> = ({ data }) => {
        const width = 300;
        const height = 100;
        const maxVal = Math.max(...data);
        const points = data.map((d, i) => `${(i / (data.length - 1)) * width},${height - (d / maxVal) * height}`).join(' ');

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                <polyline
                    fill="none"
                    stroke="rgb(var(--primary-rgb))"
                    strokeWidth="2"
                    points={points}
                />
            </svg>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
                <div className="card text-center p-6">
                    <h3 className="card-title justify-center">AI Visibility Score</h3>
                    <p className="card-description mt-1">Overall presence in AI-driven search.</p>
                    <div className="relative inline-flex items-center justify-center my-4">
                        <svg className="w-40 h-40" viewBox="0 0 100 100">
                          <circle className="text-gray-200" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50"/>
                          <circle className="text-primary" strokeWidth="10" strokeDasharray={2 * Math.PI * 45} strokeDashoffset={(2 * Math.PI * 45) - (visibilityScore / 100) * (2 * Math.PI * 45)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }} />
                        </svg>
                        <span className="absolute text-4xl font-bold text-primary">{visibilityScore}</span>
                    </div>
                </div>
                 <StatCard title="AI Mentions" value={aiMentions.toString()} icon={<ChatBubbleLeftRightIcon className="w-6 h-6 text-indigo-500" />} iconBg="bg-indigo-100" />
                 <StatCard title="Cited Pages" value={citedPages.toString()} icon={<LinkIcon className="w-6 h-6 text-sky-500" />} iconBg="bg-sky-100" />
            </div>

            <div className="lg:col-span-2 space-y-8">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">AI Mentions Over Time</h3>
                    </div>
                    <div className="card-content">
                        <LineChart data={mentionsHistory} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <StatCard title="Entity Coverage" value={`${entityCoverage}%`} icon={<Squares2x2Icon className="w-6 h-6 text-rose-500" />} iconBg="bg-rose-100" />
                     <StatCard title="Schema Validity" value={`${schemaValidity}%`} icon={<CodeBracketIcon className="w-6 h-6 text-teal-500" />} iconBg="bg-teal-100" />
                </div>
                
                 <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Top Cited Pages</h3>
                    </div>
                    <div className="card-content p-0">
                        <ul className="divide-y divide-border">
                            {topCitedPages.map(page => (
                                <li key={page.url} className="px-6 py-4 flex items-center justify-between hover:bg-secondary/30">
                                    <div>
                                        <a href={page.url} className="font-semibold text-foreground hover:text-primary hover:underline">{page.title}</a>
                                        <p className="text-sm text-muted-foreground">{page.url}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-primary">{page.citations}</p>
                                        <p className="text-xs text-muted-foreground">Citations</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiVisibilityDashboard;
