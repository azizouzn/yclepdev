import React from 'react';

const ScaleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52v1.666c0 .414-.168.79-.44 1.06l-1.933 1.933c-.273.273-.646.44-1.06.44H4.44a1.06 1.06 0 0 1-1.06-1.06l-1.933-1.933a1.06 1.06 0 0 1-.44-1.06V5.49c0-1.01.317-2.01.52-3m.52 3a48.45 48.45 0 0 1 3-.52M3 13.5h18M3 7.5h18" />
  </svg>
);

export default ScaleIcon;