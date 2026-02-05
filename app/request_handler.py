import asyncio
import uuid
import time
from datetime import datetime
from enum import Enum
from typing import Dict, Any, Optional, Callable
import logging
from dataclasses import dataclass, field
from collections import deque
import heapq

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

    async def process_tasks(self, processor: Callable, max_tasks: Optional[int] = None):
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

            try:
                logger.info(f"Processing task {task.id}")
                result = await processor(task)
                async with self._lock:
                    task.status = TaskStatus.COMPLETED
                    task.result = result
                    task.updated_at = time.time()
                    del self.active_tasks[task.id]
                    self.completed_tasks.append(task)
                    self.stats["completed_tasks"] += 1

                if task.callback:
                    try:
                        await task.callback(task)
                    except Exception as e:
                        logger.error(f"Callback failed for task {task.id}: {str(e)}")

                logger.info(f"Task {task.id} completed successfully")
            except Exception as e:
                async with self._lock:
                    task.status = TaskStatus.FAILED
                    task.error = str(e)
                    task.updated_at = time.time()
                    del self.active_tasks[task.id]
                    self.stats["failed_tasks"] += 1
                logger.error(f"Task {task.id} failed: {str(e)}")
            finally:
                processed_count += 1

        logger.info(f"Task processing completed. Processed {processed_count} tasks")

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
        while self.active_tasks:
            await asyncio.sleep(1)
        logger.info("RequestHandler shutdown complete")
