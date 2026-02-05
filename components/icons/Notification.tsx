import React, { useContext, useEffect, useState } from 'react';
import { NotificationStateContext } from '../../contexts/NotificationContext';
import CheckCircleIcon from './CheckCircleIcon';
import XCircleIcon from './XCircleIcon';
import ExclamationTriangleIcon from './ExclamationTriangleIcon';

const notificationConfig = {
    success: { Icon: CheckCircleIcon, color: 'green', base: 'bg-green-500', text: 'text-white' },
    error: { Icon: XCircleIcon, color: 'red', base: 'bg-red-500', text: 'text-white' },
    info: { Icon: ExclamationTriangleIcon, color: 'blue', base: 'bg-blue-500', text: 'text-white' }
};

const Notification: React.FC = () => {
    const notification = useContext(NotificationStateContext);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [notification]);

    if (!notification) {
        return null;
    }

    const { Icon, base, text } = notificationConfig[notification.type];

    return (
        <div 
            role="alert"
            aria-live="assertive"
            className={`fixed bottom-5 right-5 z-[100] w-full max-w-sm rounded-lg shadow-lg p-4 flex items-center transition-all duration-300 ease-in-out ${base} ${text} ${isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-4 opacity-0'}`}
        >
            <div className="flex-shrink-0">
                <Icon className="w-6 h-6" />
            </div>
            <div className="ml-3 text-sm font-medium">
                {notification.message}
            </div>
        </div>
    );
};

export default Notification;