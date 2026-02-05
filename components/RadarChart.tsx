
import React from 'react';

interface RadarChartProps {
  data: { label: string; value: number }[];
  size: number;
}

const RadarChart: React.FC<RadarChartProps> = ({ data, size }) => {
  const numPoints = data.length;
  const angleSlice = (Math.PI * 2) / numPoints;
  const radius = size * 0.35;
  const centerX = size / 2;
  const centerY = size / 2;

  // Function to calculate point coordinates
  const getPoint = (value: number, angleIndex: number) => {
    const angle = angleSlice * angleIndex - Math.PI / 2;
    const currentRadius = (value / 100) * radius;
    const x = centerX + currentRadius * Math.cos(angle);
    const y = centerY + currentRadius * Math.sin(angle);
    return `${x},${y}`;
  };

  // Generate points for the data polygon
  const dataPoints = data.map((d, i) => getPoint(d.value, i)).join(' ');
  
  // Generate grid lines and labels
  const gridLevels = 4;
  const gridLines = Array.from({ length: gridLevels }, (_, i) => {
    const level = (i + 1) / gridLevels;
    const points = Array.from({ length: numPoints }, (__, j) => getPoint(100 * level, j)).join(' ');
    return <polygon key={i} points={points} fill="none" stroke="#e5e7eb" strokeWidth="1" />;
  });
  
  const axisLines = data.map((_, i) => {
      const point = getPoint(100, i);
      return <line key={i} x1={centerX} y1={centerY} x2={point.split(',')[0]} y2={point.split(',')[1]} stroke="#e5e7eb" strokeWidth="1" />
  });

  const labels = data.map((d, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const labelRadius = radius * 1.2;
    const x = centerX + labelRadius * Math.cos(angle);
    const y = centerY + labelRadius * Math.sin(angle);
    
    return (
      <text
        key={i}
        x={x}
        y={y}
        fontSize="10"
        fill="#6b7280"
        textAnchor={x > centerX + 1 ? 'start' : x < centerX - 1 ? 'end' : 'middle'}
        dominantBaseline="middle"
      >
        {d.label}
      </text>
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g>
        {axisLines}
        {gridLines}
        {labels}
        <polygon points={dataPoints} fill="rgba(79, 70, 229, 0.4)" stroke="#4f46e5" strokeWidth="2" />
        {data.map((d, i) => {
            const [x, y] = getPoint(d.value, i).split(',');
            return <circle key={i} cx={x} cy={y} r="3" fill="#4f46e5" />
        })}
      </g>
    </svg>
  );
};

export default RadarChart;