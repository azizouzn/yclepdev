import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    showNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

// This is a separate context for the Notification component to consume the state
export const NotificationStateContext = createContext<Notification | null>(null);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notification, setNotification] = useState<Notification | null>(null);
    const [timerId, setTimerId] = useState<number | null>(null);

    const showNotification = useCallback((message: string, type: NotificationType) => {
        // If there's an existing timer, clear it to show the new notification immediately
        if (timerId) {
            clearTimeout(timerId);
        }

        const newNotification = { id: Date.now(), message, type };
        setNotification(newNotification);

        const newTimerId = window.setTimeout(() => {
            setNotification(prev => (prev?.id === newNotification.id ? null : prev));
        }, 5000); // Notification disappears after 5 seconds

        setTimerId(newTimerId);
    }, [timerId]);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            <NotificationStateContext.Provider value={notification}>
                {children}
            </NotificationStateContext.Provider>
        </NotificationContext.Provider>
    );
};