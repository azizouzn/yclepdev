import React from 'react';

const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 0 1 9 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 15.375c0-1.32.816-2.523 2.063-3.087a.5.5 0 0 0 .187-.788l-.001-.001a.5.5 0 0 0-.788-.188 4.125 4.125 0 0 0-7.874 0 .5.5 0 0 0-.788.188l-.001.001a.5.5 0 0 0 .187.788C18.684 12.852 19.5 14.055 19.5 15.375V18.75H4.5v-3.375c0-1.32.816-2.523 2.063-3.087a.5.5 0 0 0 .187-.788l-.001-.001a.5.5 0 0 0-.788-.188 4.125 4.125 0 0 0-7.874 0 .5.5 0 0 0-.788.188l-.001.001a.5.5 0 0 0 .187.788C3.684 12.852 4.5 14.055 4.5 15.375V18.75m15 0v2.25a1.5 1.5 0 0 1-1.5 1.5h-12a1.5 1.5 0 0 1-1.5-1.5V18.75m15 0h-15" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" />
  </svg>
);

export default TrophyIcon;
