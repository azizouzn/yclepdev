import React from 'react';
import ArrowRightIcon from './icons/ArrowRightIcon';

const Hero: React.FC = () => {
    return (
        <div id="showcase-target-1" className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden bg-white">
            <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] opacity-[0.2]"></div>
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_800px_at_50%_200px,#d4d4d8,transparent)] opacity-40"></div>
            
            <div className="container mx-auto px-4 text-center max-w-5xl page-transition">
                <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 mb-6 transition-colors cursor-default">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                    AI-Powered Analysis V2.0 is Live
                </div>
                
                <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl mb-6 leading-[1.1]">
                    Decisions made <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">with absolute clarity.</span>
                </h1>
                
                <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-gray-600">
                    Stop drowning in fake reviews. We use autonomous AI agents to analyze millions of data points, delivering unbiased, factual product verdicts in seconds.
                </p>
                
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <a href="#all-reviews" className="btn h-12 px-8 text-base rounded-full bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
                        Explore Reviews
                    </a>
                    <a href="/site/about" className="group text-sm font-semibold leading-6 text-gray-900 flex items-center">
                        How it works <ArrowRightIcon className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </a>
                </div>

                <div className="mt-16 flex justify-center gap-8 grayscale opacity-50">
                     {/* Mock logos for social proof style */}
                     <span className="text-lg font-bold text-gray-400">WIRED</span>
                     <span className="text-lg font-bold text-gray-400">TheVerge</span>
                     <span className="text-lg font-bold text-gray-400">TechCrunch</span>
                     <span className="text-lg font-bold text-gray-400">ProductHunt</span>
                </div>
            </div>
        </div>
    );
};

export default Hero;