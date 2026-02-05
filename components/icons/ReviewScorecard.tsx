import React from 'react';

interface ReviewScorecardProps {
  score: number;
}

const ReviewScorecard: React.FC<ReviewScorecardProps> = ({ score }) => {
  const percentage = Math.max(0, Math.min(100, score));
  const circumference = 2 * Math.PI * 45; // r=45
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-32 h-32" viewBox="0 0 100 100">
          <circle
            className="text-gray-200"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          <circle
            className={getColor()}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        <span className={`absolute text-3xl font-bold ${getColor()}`}>
          {percentage}
        </span>
      </div>
    </div>
  );
};

export default ReviewScorecard;