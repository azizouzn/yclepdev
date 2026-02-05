import React from 'react';
import type { SystemEvent } from '../types';
import BellIcon from './icons/BellIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';

interface EventLogDropdownProps {
  events: SystemEvent[];
  onClear: () => void;
}

const EventIcon: React.FC<{ type: SystemEvent['type'] }> = ({ type }) => {
    switch(type) {
        case 'AI_FAILOVER':
            return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
        default:
            return <BellIcon className="w-5 h-5 text-gray-500" />;
    }
}

const EventLogDropdown: React.FC<EventLogDropdownProps> = ({ events, onClear }) => {

    const timeSince = (dateString: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div 
            className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-30 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-4 flex items-center justify-between border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">System Notifications</h3>
                <button 
                    onClick={onClear} 
                    className="text-xs text-indigo-600 hover:underline font-medium disabled:text-gray-400"
                    disabled={events.every(e => e.read)}
                >
                    Mark all as read
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {events.length === 0 ? (
                    <div className="text-center p-8 text-sm text-gray-500">
                        <BellIcon className="w-8 h-8 mx-auto text-gray-300 mb-2"/>
                        No new notifications.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {events.map(event => (
                            <li key={event.id} className={`p-4 flex items-start gap-3 transition-colors ${!event.read ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                                <div className="flex-shrink-0 mt-1">
                                    <EventIcon type={event.type} />
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm text-gray-700">{event.details.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{timeSince(event.timestamp)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default EventLogDropdown;
