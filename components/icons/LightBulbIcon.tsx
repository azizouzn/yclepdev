
import React from 'react';

const LightBulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a7.5 7.5 0 0 1-7.5 0c-1.255 0-2.443.29-3.5.832a.75.75 0 0 1-1.02-.649l-.31-1.74c-.08-.44.26-1.01.75-1.234a11.996 11.996 0 0 1 11.022 0c.49.224.83.794.75 1.234l-.31 1.74a.75.75 0 0 1-1.02.649c-1.057-.542-2.245-.832-3.5-.832Z" />
    </svg>
);

export default LightBulbIcon;
