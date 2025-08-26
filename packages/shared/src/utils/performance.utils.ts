export interface PerformanceMetrics {
  duration: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  timestamp: number;
}

export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  opsPerSecond: number;
  memoryDelta: number;
}

export class PerformanceUtils {
  private static timers = new Map<string, number>();
  private static counters = new Map<string, number>();

  /**
   * Start a performance timer
   */
  static startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  /**
   * End a performance timer and return duration
   */
  static endTimer(name: string): number {
    const start = this.timers.get(name);
    if (!start) {
      throw new Error(`Timer '${name}' was not started`);
    }
    
    const duration = performance.now() - start;
    this.timers.delete(name);
    return duration;
  }

  /**
   * Measure execution time of a function
   */
  static async measure<T>(
    name: string,
    fn: () => Promise<T> | T
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    
    const result = await fn();
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    
    const metrics: PerformanceMetrics = {
      duration: endTime - startTime,
      memoryUsage: {
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        external: endMemory.external - startMemory.external,
        rss: endMemory.rss - startMemory.rss,
      },
      timestamp: Date.now(),
    };

    console.log(`Performance [${name}]: ${metrics.duration.toFixed(2)}ms`);
    
    return { result, metrics };
  }

  /**
   * Benchmark a function with multiple iterations
   */
  static async benchmark<T>(
    name: string,
    fn: () => Promise<T> | T,
    iterations: number = 1000
  ): Promise<BenchmarkResult> {
    const times: number[] = [];
    const startMemory = process.memoryUsage().heapUsed;
    
    // Warm up
    for (let i = 0; i < Math.min(10, iterations); i++) {
      await fn();
    }

    // Actual benchmark
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);
    }

    const endMemory = process.memoryUsage().heapUsed;
    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const opsPerSecond = 1000 / averageTime;
    const memoryDelta = endMemory - startMemory;

    const result: BenchmarkResult = {
      name,
      iterations,
      totalTime,
      averageTime,
      minTime,
      maxTime,
      opsPerSecond,
      memoryDelta,
    };

    console.log(`Benchmark [${name}]:`, {
      iterations,
      averageTime: `${averageTime.toFixed(2)}ms`,
      opsPerSecond: `${opsPerSecond.toFixed(0)} ops/sec`,
      memoryDelta: `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`,
    });

    return result;
  }

  /**
   * Create a performance decorator for methods
   */
  static performanceDecorator(name?: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      const timerName = name || `${target.constructor.name}.${propertyKey}`;

      descriptor.value = async function (...args: any[]) {
        const { result, metrics } = await PerformanceUtils.measure(
          timerName,
          () => originalMethod.apply(this, args)
        );
        return result;
      };

      return descriptor;
    };
  }

  /**
   * Increment a performance counter
   */
  static incrementCounter(name: string, value: number = 1): void {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
  }

  /**
   * Get counter value
   */
  static getCounter(name: string): number {
    return this.counters.get(name) || 0;
  }

  /**
   * Reset counter
   */
  static resetCounter(name: string): void {
    this.counters.delete(name);
  }

  /**
   * Get all counters
   */
  static getAllCounters(): Map<string, number> {
    return new Map(this.counters);
  }

  /**
   * Clear all counters
   */
  static clearCounters(): void {
    this.counters.clear();
  }

  /**
   * Get current memory usage
   */
  static getMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  /**
   * Format memory usage for display
   */
  static formatMemoryUsage(memoryUsage: NodeJS.MemoryUsage): string {
    const formatBytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)}MB`;
    
    return [
      `RSS: ${formatBytes(memoryUsage.rss)}`,
      `Heap Used: ${formatBytes(memoryUsage.heapUsed)}`,
      `Heap Total: ${formatBytes(memoryUsage.heapTotal)}`,
      `External: ${formatBytes(memoryUsage.external)}`,
    ].join(', ');
  }

  /**
   * Monitor memory usage over time
   */
  static startMemoryMonitoring(intervalMs: number = 5000): () => void {
    const interval = setInterval(() => {
      const usage = this.getMemoryUsage();
      console.log(`Memory Usage: ${this.formatMemoryUsage(usage)}`);
    }, intervalMs);

    return () => clearInterval(interval);
  }

  /**
   * Throttle function execution
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => ReturnType<T> | undefined {
    let inThrottle: boolean;
    let lastResult: ReturnType<T>;

    return function (this: any, ...args: Parameters<T>) {
      if (!inThrottle) {
        lastResult = func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
      return lastResult;
    };
  }

  /**
   * Debounce function execution
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return function (this: any, ...args: Parameters<T>) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Memoize function results for performance
   */
  static memoize<T extends (...args: any[]) => any>(
    func: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ): T {
    const cache = new Map<string, ReturnType<T>>();

    return ((...args: Parameters<T>) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }

      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }

  /**
   * Rate limiter for function calls
   */
  static createRateLimiter(maxCalls: number, windowMs: number) {
    const calls: number[] = [];

    return function <T extends (...args: any[]) => any>(func: T) {
      return (...args: Parameters<T>): ReturnType<T> | null => {
        const now = Date.now();
        
        // Remove old calls outside the window
        while (calls.length > 0 && calls[0] <= now - windowMs) {
          calls.shift();
        }

        if (calls.length >= maxCalls) {
          console.warn('Rate limit exceeded');
          return null;
        }

        calls.push(now);
        return func(...args);
      };
    };
  }

  /**
   * Create a performance profiler
   */
  static createProfiler() {
    const profiles = new Map<string, PerformanceMetrics[]>();

    return {
      profile: async <T>(name: string, fn: () => Promise<T> | T): Promise<T> => {
        const { result, metrics } = await PerformanceUtils.measure(name, fn);
        
        if (!profiles.has(name)) {
          profiles.set(name, []);
        }
        profiles.get(name)!.push(metrics);
        
        return result;
      },

      getProfile: (name: string) => profiles.get(name) || [],
      
      getAverageTime: (name: string): number => {
        const profile = profiles.get(name) || [];
        if (profile.length === 0) return 0;
        
        const total = profile.reduce((sum, p) => sum + p.duration, 0);
        return total / profile.length;
      },

      clearProfile: (name: string) => profiles.delete(name),
      
      clearAllProfiles: () => profiles.clear(),
      
      getAllProfiles: () => new Map(profiles),
    };
  }
}