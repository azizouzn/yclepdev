
import React from 'react';
import YclepLogo from './icons/YclepLogo';
import GlobeAltIcon from './icons/GlobeAltIcon';
import ArrowRightOnRectangleIcon from './icons/ArrowRightOnRectangleIcon';
import Cog6ToothIcon from './icons/Cog6ToothIcon';
import CommandLineIcon from './icons/CommandLineIcon';

interface HeaderProps {
    publishedCount: number;
    onLogout: () => void;
    onToggleCommandBar: () => void;
}

const Header: React.FC<HeaderProps> = ({ publishedCount, onLogout, onToggleCommandBar }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm transition-all duration-200">
      <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-24 h-auto text-gray-900 transition-opacity hover:opacity-80">
            <YclepLogo className="w-full h-full" />
          </div>
          <span className="hidden sm:inline-block h-5 w-px bg-gray-300"></span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:inline-block">Admin Console</span>
        </div>
        
        <div className="flex items-center gap-3">
            <button
                onClick={onToggleCommandBar}
                className="group flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600 font-medium transition-colors text-sm border border-transparent hover:border-gray-300"
                title="Command Bar (Ctrl+K)"
            >
                <CommandLineIcon className="w-4 h-4 text-gray-500 group-hover:text-gray-800" />
                <span className="hidden lg:inline">Search...</span>
                <kbd className="hidden lg:inline font-sans text-[10px] font-bold text-gray-400 border border-gray-300 rounded px-1 ml-2">⌘K</kbd>
            </button>

            <a 
                href="/site"
                className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all group"
                title="View Public Site"
            >
                <GlobeAltIcon className="w-6 h-6" />
                {publishedCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                )}
            </a>

            <a 
                href="/admin/settings"
                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                title="Settings"
            >
                <Cog6ToothIcon className="w-6 h-6" />
            </a>

            <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
            >
                <ArrowRightOnRectangleIcon className="w-6 h-6" />
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
