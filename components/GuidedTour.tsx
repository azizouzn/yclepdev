import React, { useState, useEffect, useCallback } from 'react';
import SparklesIcon from './icons/SparklesIcon';

interface GuidedTourProps {
  onComplete: (skipped: boolean) => void;
  onStepChange: (stepIndex: number) => void;
}

const tourSteps = [
  {
    selector: '#tour-step-1',
    title: 'Welcome to Yclep!',
    content: 'Get clear, unbiased product reviews powered by AI. Let us show you how it works in 30 seconds.',
    position: 'bottom',
  },
  {
    selector: '#tour-step-2',
    title: 'How It Works',
    content: 'Our AI agents analyze millions of data points from across the web to build a complete picture of every product.',
    position: 'bottom',
  },
  {
    selector: '#tour-step-3',
    title: 'Live AI Demonstration',
    content: "Watch as our AI generates a quick summary for our top-rated product. This is the clarity we bring to every review.",
    position: 'bottom',
  },
  {
    selector: '#tour-step-4',
    title: 'You\'re Ready to Explore!',
    content: 'Use the filters and search bar to find reviews for any product you\'re interested in. Happy researching!',
    position: 'top',
  },
];

const GuidedTour: React.FC<GuidedTourProps> = ({ onComplete, onStepChange }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [spotlightStyle, setSpotlightStyle] = useState({});
    const [tooltipStyle, setTooltipStyle] = useState({});
    const [isVisible, setIsVisible] = useState(false);

    const updatePositions = useCallback(() => {
        const step = tourSteps[currentStep];
        const element = document.querySelector(step.selector) as HTMLElement;
        if (!element) {
            // Element not found, maybe skip this step or end tour
            if (currentStep < tourSteps.length - 1) {
                setCurrentStep(s => s + 1);
            } else {
                onComplete(true);
            }
            return;
        }

        const rect = element.getBoundingClientRect();
        
        setSpotlightStyle({
            width: rect.width + 16,
            height: rect.height + 16,
            top: rect.top - 8,
            left: rect.left - 8,
        });

        // Calculate tooltip position
        const tooltipEl = document.getElementById('tour-tooltip');
        if (tooltipEl) {
            const tooltipRect = tooltipEl.getBoundingClientRect();
            let top = 0, left = 0;
            switch(step.position) {
                case 'bottom':
                    top = rect.bottom + 15;
                    left = rect.left + rect.width / 2 - tooltipRect.width / 2;
                    break;
                case 'top':
                    top = rect.top - tooltipRect.height - 15;
                    left = rect.left + rect.width / 2 - tooltipRect.width / 2;
                    break;
                 // Add 'left', 'right' cases if needed
            }
            // Boundary checks
            if (left < 10) left = 10;
            if (left + tooltipRect.width > window.innerWidth - 10) {
                left = window.innerWidth - tooltipRect.width - 10;
            }

            setTooltipStyle({ top, left });
        }
    }, [currentStep, onComplete]);

    useEffect(() => {
        setIsVisible(true);
        // A slight delay to allow the element to be in the DOM for position calculation
        const timer = setTimeout(updatePositions, 50);
        
        window.addEventListener('resize', updatePositions);
        window.addEventListener('scroll', updatePositions);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePositions);
            window.removeEventListener('scroll', updatePositions);
        };
    }, [currentStep, updatePositions]);
    
    useEffect(() => {
        onStepChange(currentStep);
    }, [currentStep, onStepChange]);

    const handleNext = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete(false);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        onComplete(true);
    };

    const step = tourSteps[currentStep];
    if (!step) return null;

  return (
    <>
      <div className="tour-overlay" style={{ opacity: isVisible ? 1 : 0 }} onClick={handleSkip} />
      <div className="tour-spotlight" style={spotlightStyle} />
      <div id="tour-tooltip" className="tour-tooltip" style={{ ...tooltipStyle, opacity: isVisible ? 1 : 0 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3">
            <SparklesIcon className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
            <div>
                <h3 className="font-bold text-lg text-white mb-2">{step.title}</h3>
                <p className="text-sm">{step.content}</p>
            </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <button onClick={handleSkip} className="text-xs text-gray-400 hover:text-white">Skip Tour</button>
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button onClick={handlePrev} className="px-3 py-1.5 text-sm font-semibold bg-gray-600 text-white rounded-md hover:bg-gray-500">
                Previous
              </button>
            )}
            <button onClick={handleNext} className="px-4 py-1.5 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-500">
              {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GuidedTour;
