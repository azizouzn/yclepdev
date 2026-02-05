import React from 'react';

const ServerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 0 0-.12-1.03l-2.268-9.64a3.375 3.375 0 0 0-3.285-2.65H8.228a3.375 3.375 0 0 0-3.285 2.65l-2.268 9.64a4.5 4.5 0 0 0-.12 1.03v.228m15.54 0a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25m15.54 0v-4.5a2.25 2.25 0 0 0-2.25-2.25H4.5a2.25 2.25 0 0 0-2.25 2.25v4.5m15.54 0a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25M6.75 12h.008v.008H6.75V12Zm3.75 0h.008v.008h-.008V12Zm3.75 0h.008v.008h-.008V12Z" />
    </svg>
);

export default ServerIcon;
