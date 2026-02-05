
import React from 'react';
import { ContentStatus } from '../types';
import MagnifyingGlassIcon from './icons/MagnifyingGlassIcon';

interface DashboardControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: ContentStatus | 'ALL';
  setFilterStatus: (status: ContentStatus | 'ALL') => void;
}

const filterOptions: { label: string; value: ContentStatus | 'ALL' }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: ContentStatus.PENDING },
    { label: 'Completed', value: ContentStatus.COMPLETED },
    { label: 'Published', value: ContentStatus.PUBLISHED },
    { label: 'Stale', value: ContentStatus.STALE },
    { label: 'Failed', value: ContentStatus.FAILED },
];

const DashboardControls: React.FC<DashboardControlsProps> = ({ searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  return (
    <div className="card p-4 flex flex-col sm:flex-row items-center gap-4">
      <div className="relative w-full sm:w-auto sm:flex-grow">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {filterOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setFilterStatus(option.value)}
            className={`px-3 py-1.5 text-sm rounded-md font-semibold transition-colors ${
              filterStatus === option.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardControls;