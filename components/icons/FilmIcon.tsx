
import React from 'react';

const FilmIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3.75v3.75m-3.75-3.75v3.75m0-3.75l-1.5-1.5M9 16.5l1.5-1.5m6 0l1.5 1.5m-1.5-1.5l-1.5 1.5M3 6.75h18M3 11.25h18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5a1.5 1.5 0 0 1 1.5 1.5v11.25a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5Z" />
    </svg>
);

export default FilmIcon;
