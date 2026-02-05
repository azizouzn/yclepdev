
import React from 'react';
import SparklesIcon from './icons/SparklesIcon';
import ServerIcon from './icons/ServerIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import YclepLogo from './icons/YclepLogo';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center mb-4">
            <div className="bg-emerald-100 p-3 rounded-full mr-4">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-500">{children}</p>
    </div>
);


const AboutPage: React.FC = () => {
    return (
        <div className="bg-gray-50">
            <div className="container mx-auto px-4 md:px-8 py-16">
                <div className="text-center mb-12 max-w-3xl mx-auto">
                    <div className="w-40 h-auto mx-auto mb-6">
                        <YclepLogo className="w-full h-full" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                        About Yclep
                    </h1>
                    <p className="mt-6 text-lg text-gray-600">
                        We are a team of AI agents and data scientists dedicated to bringing clarity and honesty to the world of product reviews. Our mission is to cut through the marketing noise and deliver unbiased, data-driven insights you can trust.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <FeatureCard
                        icon={<ServerIcon className="w-6 h-6 text-emerald-600" />}
                        title="AI-Powered Analysis"
                    >
                        Our platform uses a multi-agent system to harvest, analyze, and synthesize vast amounts of data from across the web, ensuring a comprehensive view of every product.
                    </FeatureCard>
                    <FeatureCard
                        icon={<CheckCircleIcon className="w-6 h-6 text-emerald-600" />}
                        title="Unbiased & Data-Driven"
                    >
                        We prioritize factual data over subjective opinions. Our AI scores products based on features, user sentiment, and competitive analysis, free from human bias.
                    </FeatureCard>
                    <FeatureCard
                        icon={<SparklesIcon className="w-6 h-6 text-emerald-600" />}
                        title="Humanized Content"
                    >
                        While our analysis is robotic, our output is not. We use advanced generative models to present our findings in a clear, engaging, and easy-to-understand format.
                    </FeatureCard>
                </div>
                
                <div className="bg-white p-8 md:p-12 rounded-lg border border-gray-200">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Meet Our Core AI Agents</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800">Agent ARC (Analysis & Research Core)</h4>
                            <p className="text-sm text-gray-500">Specializes in deep semantic analysis and competitor intelligence.</p>
                        </div>
                         <div>
                            <h4 className="text-lg font-semibold text-gray-800">Agent QUA (Quality & Utility Assessor)</h4>
                            <p className="text-sm text-gray-500">Filters content for quality, relevance, and factual accuracy.</p>
                        </div>
                         <div>
                            <h4 className="text-lg font-semibold text-gray-800">Agent SCRIBE (Strategic Content & Review Illuminator)</h4>
                            <p className="text-sm text-gray-500">Translates complex data into the humanized reviews you read.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AboutPage;
