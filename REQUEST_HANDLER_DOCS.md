# RequestHandler Documentation

## Overview

The `RequestHandler` is an advanced asynchronous task queue manager for handling concurrent, prioritized task execution with built-in retry logic, metrics tracking, and callback support.

## Features

### ✅ Core Capabilities

- **Priority-Based Queue**: Tasks are processed based on priority level (lower number = higher priority)
- **Concurrent Processing**: Configure max concurrent tasks (default: 10)
- **Exponential Backoff Retries**: Automatic retry with configurable attempts (default: 3)
- **Task Callbacks**: Execute custom logic after task completion
- **Metrics Tracking**: Built-in statistics (success rate, processing time, task counts)
- **Task Cancellation**: Cancel queued tasks before processing starts
- **Graceful Shutdown**: Waits for active tasks to complete with timeout

### 🔄 Task Lifecycle

```
Submitted → Queued → Processing → Completed/Failed → Callback → Archived
                ↑                       ↓
                └─── Retry with Backoff ──┘
```

### 📊 Monitoring

- Real-time task status
- Success rate calculation
- Active/queued task counts
- Processing time per task
- Historical task records (max 1000 stored)

## API Reference

### Task Submission

```python
task_id = handler.submit_task(
    task_type="data_processing",           # Task type identifier
    payload={"data": "..."},               # Task-specific data
    priority=1,                             # 1-5 (lower = higher priority)
    callback=async_callback_func,          # Optional completion callback
    metadata={"user_id": "123"}            # Optional metadata
)
```

### Task Processing

```python
await handler.process_tasks(
    processor=my_processor_func,   # Callable that processes tasks
    max_tasks=None,                 # Limit total tasks (None = unlimited)
    max_retries=3                   # Retry attempts on failure
)
```

**Processor Function Signature:**
```python
async def processor(task: Task) -> Dict[str, Any]:
    # Process task.payload
    # Return result dict
    return {"status": "success", "data": ...}
```

### Status Queries

```python
# Get complete task status
status = handler.get_task_status(task_id)
# {
#   "task_id": "...",
#   "type": "data_processing",
#   "status": "completed",
#   "processing_time": 1.23,
#   "result": {...},
#   "priority": 1
# }

# Get statistics
stats = handler.get_stats()
# {
#   "total_tasks": 100,
#   "completed_tasks": 85,
#   "failed_tasks": 5,
#   "active_tasks": 3,
#   "queued_tasks": 7,
#   "success_rate": 94.44,
#   "max_concurrent_tasks": 10
# }

# Get recent completed tasks
tasks = handler.get_completed_tasks(limit=10)

# Cancel queued task
cancelled = handler.cancel_task(task_id)
```

### Lifecycle Management

```python
# Graceful shutdown (waits for active tasks, max 30s)
await handler.shutdown()
```

## Example Usage

### Basic Example

```python
import asyncio
from request_handler import RequestHandler

async def my_processor(task):
    # Do actual processing here
    result = await some_async_operation(task.payload)
    return {"status": "done", "result": result}

async def main():
    handler = RequestHandler(max_concurrent_tasks=5)
    
    # Submit tasks
    for i in range(10):
        handler.submit_task(
            task_type="processing",
            payload={"index": i, "data": f"item_{i}"}
        )
    
    # Process all tasks
    await handler.process_tasks(my_processor)
    
    # Check results
    stats = handler.get_stats()
    print(f"Success rate: {stats['success_rate']}%")

asyncio.run(main())
```

### With Callbacks

```python
async def on_task_complete(task):
    if task.status.value == "completed":
        print(f"✓ Task {task.id} succeeded!")
        # Send notification, update database, etc.
    else:
        print(f"✗ Task {task.id} failed: {task.error}")

async def main():
    handler = RequestHandler()
    
    task_id = handler.submit_task(
        task_type="email_send",
        payload={"email": "user@example.com", "template": "welcome"},
        callback=on_task_complete
    )
    
    await handler.process_tasks(email_processor)
```

### Priority-Based Processing

```python
async def main():
    handler = RequestHandler()
    
    # High priority task (priority=1)
    urgent_id = handler.submit_task(
        task_type="alert",
        payload={"level": "critical"},
        priority=1  # Processed first
    )
    
    # Low priority task (priority=5)
    batch_id = handler.submit_task(
        task_type="batch_report",
        payload={"date": "2024-01-15"},
        priority=5  # Processed later
    )
    
    await handler.process_tasks(processor)
```

## Error Handling

### Retry Logic

Tasks automatically retry on failure with exponential backoff:
- Attempt 1: Immediate execution
- Attempt 2: Wait 1 second, retry
- Attempt 3: Wait 2 seconds, retry
- Attempt 4: Wait 4 seconds, retry
- Failed: After max attempts, mark as FAILED

### Custom Error Handling

```python
async def robust_processor(task):
    try:
        result = await risky_operation(task.payload)
        return result
    except ValueError as e:
        # Recoverable error - will retry
        raise Exception(f"Recoverable: {str(e)}")
    except Exception as e:
        # Fatal error - log and fail immediately
        logger.error(f"Fatal error: {str(e)}")
        raise

async def main():
    handler = RequestHandler()
    handler.submit_task("risky_task", {"data": "..."})
    await handler.process_tasks(robust_processor, max_retries=3)
```

## Performance Considerations

### Concurrency Tuning

```python
# For I/O-bound tasks (API calls, DB queries)
handler = RequestHandler(max_concurrent_tasks=20)

# For CPU-bound tasks
handler = RequestHandler(max_concurrent_tasks=4)

# Default (balanced)
handler = RequestHandler(max_concurrent_tasks=10)
```

### Memory Management

- Completed task history limited to 1000 entries
- Old entries automatically evicted (FIFO)
- Use `get_completed_tasks(limit=N)` to retrieve recent results

### Task Queue Optimization

```python
# Submit all tasks first
for data in large_dataset:
    handler.submit_task("process", {"data": data}, priority=calculate_priority(data))

# Then process
await handler.process_tasks(processor)

# Check final stats
stats = handler.get_stats()
```

## Task Status Values

| Status | Description |
|--------|-------------|
| `queued` | Waiting to be processed |
| `processing` | Currently being executed |
| `completed` | Successfully finished |
| `failed` | Execution failed after retries |
| `cancelled` | Cancelled before processing |

## Logging

RequestHandler integrates with Python's logging module:

```python
import logging

# Enable detailed logging
logging.basicConfig(level=logging.DEBUG)

# RequestHandler will log:
# - Task submissions
# - Processing attempts and retries
# - Task completion/failures
# - Callback execution
# - Shutdown events
```

## Thread Safety

- All state modifications are protected by `asyncio.Lock`
- Safe to submit tasks from multiple coroutines
- Safe concurrent reads of statistics

## Troubleshooting

### Tasks Not Processing

```python
# Check queue status
stats = handler.get_stats()
print(f"Queued: {stats['queued_tasks']}")
print(f"Active: {stats['active_tasks']}")

# Ensure processor is async
async def my_processor(task):  # Must use 'async def'
    return await process(task.payload)
```

### High Failure Rate

```python
# Check task errors
status = handler.get_task_status(task_id)
print(status['error'])

# Increase retries
await handler.process_tasks(processor, max_retries=5)

# Increase backoff delay (modify _execute_task_with_retry)
```

### Memory Issues

```python
# Clear old tasks
handler.completed_tasks.clear()

# Reduce concurrent task limit
handler.max_concurrent_tasks = 5
```

## Best Practices

1. **Always use priority** for different task types
2. **Implement callbacks** for notifications and cleanup
3. **Use metadata** for tracking and debugging
4. **Monitor stats** to detect bottlenecks
5. **Handle shutdown gracefully** with `await handler.shutdown()`
6. **Log errors** from failed tasks for analysis
7. **Test processor functions** independently before use
8. **Set appropriate retry count** based on task type

## Integration Examples

### Flask Integration

```python
from flask import Flask, jsonify

app = Flask(__name__)
handler = RequestHandler()

@app.route('/api/tasks', methods=['POST'])
async def submit_task():
    data = request.json
    task_id = handler.submit_task(
        task_type=data['type'],
        payload=data['payload'],
        priority=data.get('priority', 3)
    )
    return jsonify({"task_id": task_id})

@app.route('/api/tasks/<task_id>/status')
async def get_status(task_id):
    status = handler.get_task_status(task_id)
    return jsonify(status)
```

### Background Task Processing

```python
async def process_background_tasks():
    handler = RequestHandler(max_concurrent_tasks=5)
    
    while True:
        # Periodically process tasks
        await handler.process_tasks(task_processor, max_tasks=100)
        await asyncio.sleep(60)

# Run in background
asyncio.create_task(process_background_tasks())
```

## Version History

- **v1.0**: Initial release with core task queue functionality
- **v1.1**: Added exponential backoff retry logic
- **v1.2**: Added callback support and metrics tracking
- **v1.3**: Enhanced shutdown with timeout and graceful termination

## License

MIT License - See LICENSE file for details
