#!/usr/bin/env python3
"""
Test suite for RequestHandler - demonstrates usage and validates functionality
"""

import asyncio
import random
from request_handler import RequestHandler, TaskStatus, Task


async def mock_processor(task: Task):
    """Simulate task processing with random success/failure"""
    await asyncio.sleep(random.uniform(0.1, 0.5))
    
    # 80% success rate
    if random.random() > 0.2:
        return {
            "status": "completed",
            "processed_at": asyncio.get_event_loop().time(),
            "data": f"Processed {task.type} task with payload: {task.payload}"
        }
    else:
        raise Exception(f"Random processing error for task {task.id}")


async def task_callback(task: Task):
    """Callback executed after task completion"""
    if task.status == TaskStatus.COMPLETED:
        print(f"✓ Task {task.id} completed with result: {task.result}")
    else:
        print(f"✗ Task {task.id} failed with error: {task.error}")


async def test_request_handler():
    """Test RequestHandler with various scenarios"""
    
    handler = RequestHandler(max_concurrent_tasks=5)
    
    print("=" * 60)
    print("RequestHandler Test Suite")
    print("=" * 60)
    
    # Submit various tasks
    print("\n📝 Submitting 20 tasks...")
    task_ids = []
    for i in range(20):
        task_id = handler.submit_task(
            task_type=random.choice(["image_generation", "data_processing", "report_generation"]),
            payload={"input_data": f"Sample input {i}", "index": i},
            priority=random.randint(1, 5),
            callback=task_callback,
            metadata={"user_id": "test_user", "batch_id": "batch_001"}
        )
        task_ids.append(task_id)
        print(f"  ✓ Task {i+1}/20: {task_id[:8]}... submitted")
    
    print(f"\n🔄 Processing {len(task_ids)} tasks with max 5 concurrent...")
    
    # Process tasks
    await handler.process_tasks(mock_processor, max_retries=2)
    
    # Display statistics
    print("\n📊 Final Statistics:")
    stats = handler.get_stats()
    for key, value in stats.items():
        print(f"  • {key}: {value}")
    
    # Display task details
    print("\n📋 Recent Completed Tasks:")
    completed = handler.get_completed_tasks(limit=5)
    for task_data in completed:
        status_symbol = "✓" if task_data["status"] == "completed" else "✗"
        print(f"  {status_symbol} {task_data['task_id'][:8]}... | {task_data['type'][:20]:20} | {task_data['processing_time']:.2f}s")
    
    # Test task status retrieval
    print("\n🔍 Sample Task Details:")
    if task_ids:
        sample_task_id = task_ids[0]
        status = handler.get_task_status(sample_task_id)
        print(f"  Task: {status['task_id'][:8]}...")
        print(f"  Type: {status['type']}")
        print(f"  Status: {status['status']}")
        print(f"  Processing Time: {status['processing_time']:.2f}s" if status['processing_time'] else "  Processing Time: Pending")
    
    print("\n✅ Test completed successfully!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_request_handler())
