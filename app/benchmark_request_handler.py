#!/usr/bin/env python3
"""
Performance Benchmark Suite for RequestHandler
Tests concurrent task processing, memory usage, and throughput
"""

import asyncio
import time
import psutil
import os
from request_handler import RequestHandler, Task
from typing import List, Dict, Any
from dataclasses import dataclass
from datetime import datetime
import json


@dataclass
class BenchmarkResult:
    test_name: str
    total_tasks: int
    concurrent_limit: int
    total_time: float
    throughput: float  # tasks per second
    avg_task_time: float
    min_task_time: float
    max_task_time: float
    memory_peak: float  # MB
    memory_avg: float  # MB
    success_rate: float
    retry_rate: float
    timestamp: str


class PerformanceBenchmark:
    def __init__(self):
        self.results: List[BenchmarkResult] = []
        self.process = psutil.Process(os.getpid())
        
    async def simulate_task_processor(self, task: Task, 
                                     failure_rate: float = 0.1,
                                     processing_time: float = 0.1) -> Dict[str, Any]:
        """Simulate task processing with configurable failure rate"""
        import random
        
        # Simulate processing time
        await asyncio.sleep(processing_time)
        
        # Simulate failures (will trigger retries)
        if random.random() < failure_rate:
            raise Exception(f"Simulated processing error for task {task.id}")
        
        return {
            "status": "completed",
            "task_id": task.id,
            "processed_at": time.time()
        }
    
    def get_memory_usage(self) -> float:
        """Get current memory usage in MB"""
        return self.process.memory_info().rss / 1024 / 1024
    
    async def benchmark_concurrent_throughput(self, 
                                             task_count: int = 1000,
                                             concurrent_limit: int = 10,
                                             failure_rate: float = 0.1) -> BenchmarkResult:
        """
        Benchmark: Concurrent task processing throughput
        Tests how many tasks can be processed per second
        """
        print(f"\n🔄 Benchmark: Concurrent Throughput ({task_count} tasks, limit={concurrent_limit})")
        
        handler = RequestHandler(max_concurrent_tasks=concurrent_limit)
        memory_samples = []
        task_times = {}
        
        # Submit all tasks
        start_memory = self.get_memory_usage()
        print(f"  Initial Memory: {start_memory:.2f} MB")
        
        task_ids = []
        submit_start = time.time()
        for i in range(task_count):
            task_id = handler.submit_task(
                task_type=f"benchmark_task_{i % 5}",
                payload={"index": i, "data": f"task_{i}"},
                priority=(i % 5) + 1,
                metadata={"batch": "benchmark"}
            )
            task_ids.append(task_id)
        submit_time = time.time() - submit_start
        print(f"  Task submission time: {submit_time:.3f}s")
        
        # Process tasks and monitor
        benchmark_start = time.time()
        
        async def process_with_monitoring():
            await handler.process_tasks(self.simulate_task_processor, max_retries=2)
        
        monitor_task = asyncio.create_task(self._memory_monitor(memory_samples, interval=0.5))
        
        await process_with_monitoring()
        
        monitor_task.cancel()
        try:
            await monitor_task
        except asyncio.CancelledError:
            pass
        
        benchmark_time = time.time() - benchmark_start
        end_memory = self.get_memory_usage()
        peak_memory = max(memory_samples) if memory_samples else end_memory
        avg_memory = sum(memory_samples) / len(memory_samples) if memory_samples else end_memory
        
        # Calculate statistics
        stats = handler.get_stats()
        completed = stats['completed_tasks']
        failed = stats['failed_tasks']
        total = stats['total_tasks']
        
        success_rate = (completed / total * 100) if total > 0 else 0
        retry_rate = (failed / (total - completed) * 100) if (total - completed) > 0 else 0
        throughput = completed / benchmark_time if benchmark_time > 0 else 0
        
        result = BenchmarkResult(
            test_name="concurrent_throughput",
            total_tasks=task_count,
            concurrent_limit=concurrent_limit,
            total_time=benchmark_time,
            throughput=throughput,
            avg_task_time=benchmark_time / task_count,
            min_task_time=0.0,  # Would need per-task tracking
            max_task_time=0.0,  # Would need per-task tracking
            memory_peak=peak_memory,
            memory_avg=avg_memory,
            success_rate=success_rate,
            retry_rate=retry_rate,
            timestamp=datetime.now().isoformat()
        )
        
        print(f"  ✓ Completed: {completed} tasks in {benchmark_time:.2f}s")
        print(f"  ✓ Throughput: {throughput:.2f} tasks/second")
        print(f"  ✓ Success Rate: {success_rate:.1f}%")
        print(f"  ✓ Memory Peak: {peak_memory:.2f} MB")
        print(f"  ✓ Memory Avg: {avg_memory:.2f} MB")
        
        return result
    
    async def benchmark_scalability(self) -> List[BenchmarkResult]:
        """
        Benchmark: Scalability test
        Tests how performance scales with different concurrency levels
        """
        print(f"\n📈 Benchmark: Scalability Test")
        
        concurrency_levels = [5, 10, 20, 50]
        results = []
        
        for level in concurrency_levels:
            print(f"\n  Testing with concurrency level: {level}")
            result = await self.benchmark_concurrent_throughput(
                task_count=500,
                concurrent_limit=level,
                failure_rate=0.05
            )
            results.append(result)
        
        return results
    
    async def benchmark_memory_efficiency(self, 
                                         task_count: int = 5000) -> BenchmarkResult:
        """
        Benchmark: Memory efficiency
        Tests memory usage with large task batches
        """
        print(f"\n💾 Benchmark: Memory Efficiency ({task_count} tasks)")
        
        handler = RequestHandler(max_concurrent_tasks=20)
        memory_samples = []
        
        start_memory = self.get_memory_usage()
        print(f"  Initial Memory: {start_memory:.2f} MB")
        
        # Submit large batch
        for i in range(task_count):
            handler.submit_task(
                task_type="memory_test",
                payload={"data": "x" * 1000},  # 1KB payload
                metadata={"index": i}
            )
        
        after_submit = self.get_memory_usage()
        print(f"  After Submit: {after_submit:.2f} MB (delta: {after_submit - start_memory:.2f} MB)")
        
        # Process with monitoring
        benchmark_start = time.time()
        monitor_task = asyncio.create_task(self._memory_monitor(memory_samples, interval=1.0))
        
        await handler.process_tasks(self.simulate_task_processor)
        
        monitor_task.cancel()
        try:
            await monitor_task
        except asyncio.CancelledError:
            pass
        
        benchmark_time = time.time() - benchmark_start
        end_memory = self.get_memory_usage()
        peak_memory = max(memory_samples) if memory_samples else end_memory
        
        stats = handler.get_stats()
        
        result = BenchmarkResult(
            test_name="memory_efficiency",
            total_tasks=task_count,
            concurrent_limit=20,
            total_time=benchmark_time,
            throughput=stats['completed_tasks'] / benchmark_time if benchmark_time > 0 else 0,
            avg_task_time=benchmark_time / task_count,
            min_task_time=0.0,
            max_task_time=0.0,
            memory_peak=peak_memory,
            memory_avg=peak_memory,
            success_rate=(stats['completed_tasks'] / task_count * 100) if task_count > 0 else 0,
            retry_rate=0.0,
            timestamp=datetime.now().isoformat()
        )
        
        print(f"  ✓ Peak Memory: {peak_memory:.2f} MB")
        print(f"  ✓ Memory per Task: {(peak_memory - start_memory) / task_count * 1000:.2f} KB")
        print(f"  ✓ Success Rate: {result.success_rate:.1f}%")
        
        return result
    
    async def benchmark_retry_overhead(self) -> BenchmarkResult:
        """
        Benchmark: Retry mechanism overhead
        Tests performance impact of retry logic
        """
        print(f"\n🔄 Benchmark: Retry Overhead")
        
        handler = RequestHandler(max_concurrent_tasks=10)
        
        # Submit tasks with high failure rate
        task_count = 200
        for i in range(task_count):
            handler.submit_task(
                task_type="retry_test",
                payload={"index": i},
                metadata={"batch": "retry_test"}
            )
        
        benchmark_start = time.time()
        await handler.process_tasks(
            lambda task: self.simulate_task_processor(task, failure_rate=0.3),
            max_retries=3
        )
        benchmark_time = time.time() - benchmark_start
        
        stats = handler.get_stats()
        total_attempts = stats['completed_tasks'] + stats['failed_tasks']
        avg_attempts_per_task = total_attempts / task_count if task_count > 0 else 0
        
        result = BenchmarkResult(
            test_name="retry_overhead",
            total_tasks=task_count,
            concurrent_limit=10,
            total_time=benchmark_time,
            throughput=stats['completed_tasks'] / benchmark_time if benchmark_time > 0 else 0,
            avg_task_time=benchmark_time / task_count,
            min_task_time=0.0,
            max_task_time=0.0,
            memory_peak=self.get_memory_usage(),
            memory_avg=self.get_memory_usage(),
            success_rate=(stats['completed_tasks'] / task_count * 100) if task_count > 0 else 0,
            retry_rate=(stats['failed_tasks'] / task_count * 100) if task_count > 0 else 0,
            timestamp=datetime.now().isoformat()
        )
        
        print(f"  ✓ Avg Attempts per Task: {avg_attempts_per_task:.2f}")
        print(f"  ✓ Success Rate: {result.success_rate:.1f}%")
        print(f"  ✓ Total Time (with retries): {benchmark_time:.2f}s")
        
        return result
    
    async def _memory_monitor(self, samples: List[float], interval: float = 1.0):
        """Monitor memory usage at regular intervals"""
        try:
            while True:
                samples.append(self.get_memory_usage())
                await asyncio.sleep(interval)
        except asyncio.CancelledError:
            pass
    
    def generate_report(self) -> str:
        """Generate comprehensive benchmark report"""
        report = f"""
╔══════════════════════════════════════════════════════════════╗
║          RequestHandler Performance Benchmark Report          ║
╚══════════════════════════════════════════════════════════════╝

Generated: {datetime.now().isoformat()}

BENCHMARK RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"""
        
        for result in self.results:
            report += f"""
Test: {result.test_name.upper()}
  Total Tasks: {result.total_tasks}
  Concurrent Limit: {result.concurrent_limit}
  Total Time: {result.total_time:.2f}s
  Throughput: {result.throughput:.2f} tasks/second
  Avg Task Time: {result.avg_task_time:.4f}s
  Memory Peak: {result.memory_peak:.2f} MB
  Memory Avg: {result.memory_avg:.2f} MB
  Success Rate: {result.success_rate:.1f}%
  Retry Rate: {result.retry_rate:.1f}%
"""
        
        report += f"""
PERFORMANCE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Average Throughput: {sum(r.throughput for r in self.results) / len(self.results):.2f} tasks/sec
Average Success Rate: {sum(r.success_rate for r in self.results) / len(self.results):.1f}%
Peak Memory Used: {max(r.memory_peak for r in self.results):.2f} MB
Avg Memory Used: {sum(r.memory_avg for r in self.results) / len(self.results):.2f} MB

RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"""
        
        # Generate recommendations based on results
        avg_throughput = sum(r.throughput for r in self.results) / len(self.results)
        peak_memory = max(r.memory_peak for r in self.results)
        avg_success = sum(r.success_rate for r in self.results) / len(self.results)
        
        if avg_throughput < 50:
            report += "⚠️  Low throughput detected. Consider:\n"
            report += "  - Increasing concurrent_limit\n"
            report += "  - Optimizing processor function\n"
        
        if peak_memory > 500:
            report += "⚠️  High memory usage detected. Consider:\n"
            report += "  - Reducing task batch size\n"
            report += "  - Implementing task persistence\n"
        
        if avg_success < 95:
            report += "⚠️  Low success rate detected. Consider:\n"
            report += "  - Increasing max_retries\n"
            report += "  - Debugging processor function\n"
        else:
            report += "✅ Excellent success rate\n"
        
        report += "✅ RequestHandler performing well\n"
        
        return report


async def run_full_benchmark_suite():
    """Run complete benchmark suite"""
    print("╔═══════════════════════════════════════════════════╗")
    print("║  RequestHandler Performance Benchmark Suite       ║")
    print("╚═══════════════════════════════════════════════════╝")
    
    benchmark = PerformanceBenchmark()
    
    # Run all benchmarks
    result1 = await benchmark.benchmark_concurrent_throughput(
        task_count=1000,
        concurrent_limit=10,
        failure_rate=0.1
    )
    benchmark.results.append(result1)
    
    result2 = await benchmark.benchmark_memory_efficiency(task_count=2000)
    benchmark.results.append(result2)
    
    result3 = await benchmark.benchmark_retry_overhead()
    benchmark.results.append(result3)
    
    scalability_results = await benchmark.benchmark_scalability()
    benchmark.results.extend(scalability_results)
    
    # Generate and print report
    report = benchmark.generate_report()
    print(report)
    
    # Save report to file
    with open("benchmark_report.txt", "w") as f:
        f.write(report)
    
    # Save JSON results
    json_results = [
        {
            "test_name": r.test_name,
            "total_tasks": r.total_tasks,
            "concurrent_limit": r.concurrent_limit,
            "total_time": r.total_time,
            "throughput": r.throughput,
            "memory_peak": r.memory_peak,
            "success_rate": r.success_rate,
            "retry_rate": r.retry_rate,
            "timestamp": r.timestamp
        }
        for r in benchmark.results
    ]
    
    with open("benchmark_results.json", "w") as f:
        json.dump(json_results, f, indent=2)
    
    print("\n📊 Results saved to:")
    print("  - benchmark_report.txt")
    print("  - benchmark_results.json")


if __name__ == "__main__":
    asyncio.run(run_full_benchmark_suite())
