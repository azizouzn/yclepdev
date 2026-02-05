
import React from 'react';
import YclepLogo from './icons/YclepLogo';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import MagnifyingGlassIcon from './icons/MagnifyingGlassIcon';

interface PublicHeaderProps {
    isAdmin: boolean;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    route: string;
}

const NavLink: React.FC<{ href: string; currentRoute: string; children: React.ReactNode }> = ({ href, currentRoute, children }) => {
    const isActive = href === currentRoute;
    return (
        <a href={href} className={`text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            {children}
        </a>
    );
};


const PublicHeader: React.FC<PublicHeaderProps> = ({ isAdmin, searchTerm, onSearchChange, route }) => {
  return (
    <header className="glass-header sticky top-0 z-40 w-full">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
            <a href="/site" className="flex items-center flex-shrink-0 group">
              <div className="w-28 h-auto transition-transform group-hover:scale-105">
                <YclepLogo className="w-full h-full" />
              </div>
            </a>
            <nav className="hidden md:flex items-center space-x-6">
                <NavLink href="/site" currentRoute={route}>Reviews</NavLink>
                <NavLink href="/site/guides" currentRoute={route}>Buying Guides</NavLink>
                <NavLink href="/site/blog" currentRoute={route}>Journal</NavLink>
            </nav>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative w-full max-w-[200px] hidden sm:block">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-9 w-full bg-secondary/50 border-transparent rounded-md py-1 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all hover:bg-secondary"
                />
            </div>

            {isAdmin && (
                <a 
                    href="/admin"
                    className="flex-shrink-0 h-9 px-4 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-white hover:bg-primary/90 shadow-sm transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Admin
                </a>
            )}
            
            {!isAdmin && (
                 <a 
                    href="/site/about"
                    className="h-9 px-4 inline-flex items-center justify-center rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                    About
                </a>
            )}
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;