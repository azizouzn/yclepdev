import React from 'react';
import type { CompetitivePositioning } from '../types';

interface CompetitiveMatrixProps {
  positioning: CompetitivePositioning;
}

const CompetitiveMatrix: React.FC<CompetitiveMatrixProps> = ({ positioning }) => {
  const { x_axis_label, y_axis_label, competitors } = positioning;

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto my-4">
      {/* Grid background and axes */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px bg-gray-200 border border-gray-300 rounded-lg">
        <div className="bg-white/50"></div>
        <div className="bg-white/50"></div>
        <div className="bg-white/50"></div>
        <div className="bg-white/50"></div>
      </div>
      {/* Y-axis label */}
      <div className="absolute -left-4 top-0 bottom-0 flex items-center -rotate-90">
        <span className="text-xs text-gray-500 font-semibold tracking-wider uppercase">{y_axis_label}</span>
      </div>
      {/* X-axis label */}
      <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
        <span className="text-xs text-gray-500 font-semibold tracking-wider uppercase">{x_axis_label}</span>
      </div>

      {/* Competitor points */}
      {competitors.map((c, i) => (
        <div
          key={i}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
          style={{ left: `${c.x}%`, top: `${100 - c.y}%` }}
          title={`${c.name} (X: ${c.x}, Y: ${c.y})`}
        >
          <div className="relative flex flex-col items-center group">
             <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-10">
                {c.name}
            </span>
            <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1 border-2 border-white"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompetitiveMatrix;
