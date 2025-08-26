export class HttpUtils {
  static async retry<T>(
    fn: () => Promise<T>,
    maxAttempts = 3,
    delay = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }

        await this.sleep(delay * attempt);
      }
    }

    throw lastError!;
  }

  static async timeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  static parseQueryString(query: string): Record<string, string> {
    const params = new URLSearchParams(query);
    const result: Record<string, string> = {};
    
    for (const [key, value] of params) {
      result[key] = value;
    }
    
    return result;
  }

  static buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
    
    return searchParams.toString();
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}