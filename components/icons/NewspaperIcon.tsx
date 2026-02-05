
import React from 'react';

const NewspaperIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V21h-1.063M6.375 18h1.063m-1.063 0h-1.063a1.125 1.125 0 0 1-1.125-1.125V7.5c0-.621.504-1.125 1.125-1.125h13.5c.621 0 1.125.504 1.125 1.125v3.375M6.375 7.5v-1.125A2.25 2.25 0 0 1 8.625 4.5h6.75a2.25 2.25 0 0 1 2.25 2.25V7.5" />
    </svg>
);

export default NewspaperIcon;
