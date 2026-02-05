import React from 'react';
import GlobeAltIcon from './icons/GlobeAltIcon';
import SparklesIcon from './icons/SparklesIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode, id?: string }> = ({ icon, title, children, id }) => (
    <div id={id} className="card p-8 text-center transition-transform duration-300 hover:-translate-y-2">
        <div className="inline-block bg-emerald-100 p-4 rounded-full mb-5 ring-4 ring-emerald-500/10">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2">{children}</p>
    </div>
);

const ProcessShowcase: React.FC = () => {
    return (
        <div id="showcase-target-2" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 md:px-8">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        How Our AI Works
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        A three-step process to deliver the most reliable reviews on the web.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <FeatureCard
                        icon={<GlobeAltIcon className="w-10 h-10 text-emerald-600" />}
                        title="1. Data Aggregation"
                    >
                        Our AI scours the web, gathering data from reviews, forums, and official sources to build a complete picture.
                    </FeatureCard>
                    <FeatureCard
                        id="showcase-target-3"
                        icon={<SparklesIcon className="w-10 h-10 text-emerald-600" />}
                        title="2. In-Depth Analysis"
                    >
                        Gemini agents analyze the data, identifying key features, competitor strategies, and user sentiment.
                    </FeatureCard>
                    <FeatureCard
                        icon={<CheckCircleIcon className="w-10 h-10 text-emerald-600" />}
                        title="3. Unbiased Verdicts"
                    >
                        We distill complex information into easy-to-read reviews and a simple score, so you can choose with confidence.
                    </FeatureCard>
                </div>
            </div>
        </div>
    );
};

export default ProcessShowcase;