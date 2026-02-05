
import React, { useState } from 'react';
import ThumbUpIcon from './icons/ThumbUpIcon';
import ThumbDownIcon from './icons/ThumbDownIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

const FeedbackWidget: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        setSubmitted(true);
    };

    return (
        <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
            {submitted ? (
                <div className="flex flex-col items-center text-green-600">
                    <CheckCircleIcon className="w-10 h-10 mb-2" />
                    <p className="font-semibold">Thanks for your feedback!</p>
                </div>
            ) : (
                <>
                    <h3 className="font-semibold text-gray-800">Was this review helpful?</h3>
                    <div className="flex justify-center gap-4 mt-4">
                        <button 
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Yes, this was helpful"
                        >
                            <ThumbUpIcon className="w-5 h-5"/>
                            Yes
                        </button>
                        <button 
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="No, this was not helpful"
                        >
                            <ThumbDownIcon className="w-5 h-5" />
                            No
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default FeedbackWidget;
