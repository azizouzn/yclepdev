import asyncio
import uuid
import time
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, Any, Optional, Callable, Awaitable
import logging
from dataclasses import dataclass, field, asdict
from collections import deque
import heapq
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)


class TaskStatus(Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class Task:
    id: str
    type: str
    payload: Dict[str, Any]
    status: TaskStatus = TaskStatus.QUEUED
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    priority: int = 1
    callback: Optional[Callable] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


class RequestHandler:
    def __init__(self, max_concurrent_tasks: int = 10):
        self.max_concurrent_tasks = max_concurrent_tasks
        self.active_tasks: Dict[str, Task] = {}
        self.task_queue = []
        self.task_registry: Dict[str, Task] = {}
        self.completed_tasks: deque = deque(maxlen=1000)
        self._lock = asyncio.Lock()
        self._shutdown = False

        self.stats = {
            "total_tasks": 0,
            "completed_tasks": 0,
            "failed_tasks": 0,
            "avg_processing_time": 0.0
        }

        logger.info(f"RequestHandler initialized with max {max_concurrent_tasks} concurrent tasks")

    def submit_task(self, task_type: str, payload: Dict[str, Any], 
                   priority: int = 1, callback: Optional[Callable] = None,
                   metadata: Optional[Dict[str, Any]] = None) -> str:
        task_id = str(uuid.uuid4())
        task = Task(
            id=task_id,
            type=task_type,
            payload=payload,
            priority=priority,
            callback=callback,
            metadata=metadata or {}
        )

        heapq.heappush(self.task_queue, (priority, time.time(), task))
        self.task_registry[task_id] = task
        self.stats["total_tasks"] += 1
        logger.info(f"Task {task_id} submitted (type: {task_type}, priority: {priority})")
        return task_id

    async def process_tasks(self, processor: Callable, max_tasks: Optional[int] = None, max_retries: int = 3):
        processed_count = 0
        while not self._shutdown:
            if max_tasks and processed_count >= max_tasks:
                break

            if len(self.active_tasks) >= self.max_concurrent_tasks:
                await asyncio.sleep(0.1)
                continue

            if not self.task_queue:
                await asyncio.sleep(0.5)
                continue

            async with self._lock:
                if not self.task_queue:
                    continue
                priority, timestamp, task = heapq.heappop(self.task_queue)
                task.status = TaskStatus.PROCESSING
                task.updated_at = time.time()
                self.active_tasks[task.id] = task

            await self._execute_task_with_retry(task, processor, max_retries)
            processed_count += 1

        logger.info(f"Task processing completed. Processed {processed_count} tasks")

    async def _execute_task_with_retry(self, task: Task, processor: Callable, max_retries: int):
        """Execute task with exponential backoff retry logic"""
        attempt = 0
        while attempt < max_retries:
            try:
                logger.info(f"Processing task {task.id} (attempt {attempt + 1}/{max_retries})")
                result = await processor(task)
                
                async with self._lock:
                    task.status = TaskStatus.COMPLETED
                    task.result = result
                    task.updated_at = time.time()
                    del self.active_tasks[task.id]
                    self.completed_tasks.append(task)
                    self.stats["completed_tasks"] += 1

                if task.callback:
                    await self._execute_callback(task)

                logger.info(f"Task {task.id} completed successfully")
                return
            except Exception as e:
                attempt += 1
                if attempt >= max_retries:
                    async with self._lock:
                        task.status = TaskStatus.FAILED
                        task.error = str(e)
                        task.updated_at = time.time()
                        del self.active_tasks[task.id]
                        self.stats["failed_tasks"] += 1
                    logger.error(f"Task {task.id} failed after {max_retries} attempts: {str(e)}")
                    return
                
                # Exponential backoff: 1s, 2s, 4s
                backoff_delay = (2 ** (attempt - 1))
                logger.warning(f"Task {task.id} attempt {attempt} failed, retrying in {backoff_delay}s: {str(e)}")
                await asyncio.sleep(backoff_delay)

    async def _execute_callback(self, task: Task):
        """Execute task callback with error handling"""
        if not task.callback:
            return
        try:
            if asyncio.iscoroutinefunction(task.callback):
                await task.callback(task)
            else:
                task.callback(task)
            logger.debug(f"Callback executed successfully for task {task.id}")
        except Exception as e:
            logger.error(f"Callback failed for task {task.id}: {str(e)}")

    def get_task_status(self, task_id: str) -> Dict[str, Any]:
        if task_id not in self.task_registry:
            return {"error": "Task not found"}
        task = self.task_registry[task_id]
        return {
            "task_id": task.id,
            "type": task.type,
            "status": task.status.value,
            "created_at": datetime.fromtimestamp(task.created_at).isoformat(),
            "updated_at": datetime.fromtimestamp(task.updated_at).isoformat(),
            "processing_time": task.updated_at - task.created_at if task.status in [TaskStatus.COMPLETED, TaskStatus.FAILED] else None,
            "result": task.result if task.status == TaskStatus.COMPLETED else None,
            "error": task.error if task.status == TaskStatus.FAILED else None,
            "priority": task.priority,
            "metadata": task.metadata
        }

    async def shutdown(self):
        self._shutdown = True
        logger.info("Initiating RequestHandler shutdown...")
        
        # Wait for active tasks to complete (max 30 seconds)
        timeout = 30
        start_time = time.time()
        while self.active_tasks and (time.time() - start_time) < timeout:
            remaining = len(self.active_tasks)
            logger.info(f"Waiting for {remaining} active tasks to complete...")
            await asyncio.sleep(1)
        
        if self.active_tasks:
            logger.warning(f"Shutdown timeout: {len(self.active_tasks)} tasks still active")
        
        logger.info("RequestHandler shutdown complete")

    def get_stats(self) -> Dict[str, Any]:
        """Get handler statistics"""
        completed = self.stats["completed_tasks"]
        failed = self.stats["failed_tasks"]
        total = self.stats["total_tasks"]
        
        success_rate = (completed / total * 100) if total > 0 else 0
        
        return {
            "total_tasks": total,
            "completed_tasks": completed,
            "failed_tasks": failed,
            "active_tasks": len(self.active_tasks),
            "queued_tasks": len(self.task_queue),
            "success_rate": round(success_rate, 2),
            "max_concurrent_tasks": self.max_concurrent_tasks
        }

    def cancel_task(self, task_id: str) -> bool:
        """Cancel a task if it hasn't started processing"""
        if task_id not in self.task_registry:
            return False
        
        task = self.task_registry[task_id]
        if task.status == TaskStatus.QUEUED:
            task.status = TaskStatus.CANCELLED
            logger.info(f"Task {task_id} cancelled")
            return True
        
        return False

    def get_completed_tasks(self, limit: int = 10) -> list:
        """Get recent completed tasks"""
        tasks_list = list(self.completed_tasks)[-limit:]
        return [self._task_to_dict(task) for task in tasks_list]

    def _task_to_dict(self, task: Task) -> Dict[str, Any]:
        """Convert task to dictionary representation"""
        return {
            "task_id": task.id,
            "type": task.type,
            "status": task.status.value,
            "priority": task.priority,
            "processing_time": task.updated_at - task.created_at,
            "created_at": datetime.fromtimestamp(task.created_at).isoformat(),
            "result_summary": str(task.result)[:100] if task.result else None,
            "error": task.error
        }
