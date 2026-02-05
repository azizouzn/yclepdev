
import { query } from '../_db';
import type { Task, TaskError, TaskMetrics, ExecutionPlan } from '../types';

export const taskService = {
    create: async (taskId: string, contentId: number, agent: string, plan?: ExecutionPlan): Promise<Task> => {
        const res = await query(
            `INSERT INTO tasks (task_id, content_id, agent, status, plan, current_stage, progress, started_at, attempt)
             VALUES ($1, $2, $3, 'queued', $4, 'Initializing', 0, NOW(), 1)
             RETURNING *`,
            [taskId, contentId, agent, JSON.stringify(plan)]
        );
        const row = res.rows[0];
        return { ...row, taskId: row.task_id, contentId: row.content_id, startedAt: row.started_at };
    },

    get: async (id: string): Promise<Task | undefined> => {
        const res = await query('SELECT * FROM tasks WHERE task_id = $1', [id]);
        if (res.rows.length === 0) return undefined;
        const row = res.rows[0];
        return { 
            ...row, 
            taskId: row.task_id, 
            contentId: row.content_id, 
            startedAt: row.started_at,
            finishedAt: row.finished_at,
            currentStage: row.current_stage,
            completedSteps: row.completed_steps || [] 
        };
    },

    update: async (id: string, updates: Partial<Task>): Promise<Task | undefined> => {
        // Construct dynamic update query
        const fields: string[] = [];
            const values: unknown[] = [];
        let idx = 1;

        if (updates.plan) { fields.push(`plan = $${idx++}`); values.push(JSON.stringify(updates.plan)); }
        if (updates.context) { fields.push(`context = $${idx++}`); values.push(JSON.stringify(updates.context)); }
        if (updates.completedSteps) { fields.push(`completed_steps = $${idx++}`); values.push(updates.completedSteps); }
        
        if (fields.length === 0) return taskService.get(id);

        values.push(id);
        const res = await query(
            `UPDATE tasks SET ${fields.join(', ')} WHERE task_id = $${idx} RETURNING *`,
            values
        );
        
        if (res.rows.length === 0) return undefined;
        const row = res.rows[0];
         return { 
            ...row, 
            taskId: row.task_id, 
            contentId: row.content_id, 
            startedAt: row.started_at,
            finishedAt: row.finished_at,
            currentStage: row.current_stage,
            completedSteps: row.completed_steps || [] 
        };
    },
    
    start: async (id: string): Promise<void> => {
        await query("UPDATE tasks SET status = 'running' WHERE task_id = $1", [id]);
    },

    setCurrentStage: async (id: string, stage: string, progress: number): Promise<void> => {
        await query(
            "UPDATE tasks SET current_stage = $1, progress = $2 WHERE task_id = $3",
            [stage, progress, id]
        );
    },

    succeed: async (id: string, result: any, metrics: TaskMetrics): Promise<void> => {
        await query(
            `UPDATE tasks SET status = 'succeeded', progress = 100, result = $1, metrics = $2, finished_at = NOW() WHERE task_id = $3`,
            [JSON.stringify(result), JSON.stringify(metrics), id]
        );
    },

    fail: async (id: string, error: TaskError, metrics?: TaskMetrics): Promise<void> => {
        await query(
            `UPDATE tasks SET status = 'failed', error = $1, metrics = $2, finished_at = NOW() WHERE task_id = $3`,
            [JSON.stringify(error), JSON.stringify(metrics), id]
        );
    },
    
    incrementAttempt: async (id: string): Promise<void> => {
        await query("UPDATE tasks SET attempt = attempt + 1 WHERE task_id = $1", [id]);
    }
};
