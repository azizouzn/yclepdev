import { useState, useEffect, useCallback, useRef } from 'react';
import { getTaskStatus } from '../services/mastermindService';
import { useNotification } from '../contexts/NotificationContext';
import type { Task } from '../types';

type TaskUpdateCallback = (task: Task) => void;

export function useTaskMonitor(onTaskUpdate: TaskUpdateCallback) {
    const [activeTaskIds, setActiveTaskIds] = useState<Record<string, boolean>>({});
    const { showNotification } = useNotification();
    const onTaskUpdateRef = useRef(onTaskUpdate);

    // Keep the callback ref updated without causing the effect to re-run
    useEffect(() => {
        onTaskUpdateRef.current = onTaskUpdate;
    }, [onTaskUpdate]);

    const addTask = useCallback((taskId: string) => {
        setActiveTaskIds(prev => ({ ...prev, [taskId]: true }));
    }, []);

    const completeTask = useCallback((taskId: string) => {
        setActiveTaskIds(prev => {
            const newTasks = { ...prev };
            delete newTasks[taskId];
            return newTasks;
        });
    }, []);

    useEffect(() => {
        const taskIds = Object.keys(activeTaskIds);
        if (taskIds.length === 0) return;

        const intervalId = setInterval(async () => {
            for (const taskId of taskIds) {
                try {
                    const taskResult = await getTaskStatus(taskId);
                    
                    if (!taskResult) continue;

                    // Pass the full task object to the callback
                    onTaskUpdateRef.current(taskResult);

                    if (taskResult.status === 'succeeded' || taskResult.status === 'failed') {
                        completeTask(taskId);
                    }
                } catch (error) {
                    console.error(`Failed to poll task ${taskId}:`, error);
                    showNotification(`Could not get status for a task.`, 'error');
                    completeTask(taskId); // Stop polling a failed task
                }
            }
        }, 2500); // Poll every 2.5 seconds

        return () => clearInterval(intervalId);
    }, [activeTaskIds, completeTask, showNotification]);

    return { addTask, activeTaskIds };
}