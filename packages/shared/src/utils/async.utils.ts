export class AsyncUtils {
  static async parallel<T>(
    tasks: (() => Promise<T>)[],
    concurrency = 5
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      
      const promise = task().then(result => {
        results[i] = result;
      });

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }

    await Promise.all(executing);
    return results;
  }

  static async sequential<T>(
    tasks: (() => Promise<T>)[]
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (const task of tasks) {
      results.push(await task());
    }
    
    return results;
  }

  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): T {
    let timeoutId: NodeJS.Timeout;
    
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T {
    let inThrottle: boolean;
    
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  }

  static async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage = 'Operation timed out'
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }
}