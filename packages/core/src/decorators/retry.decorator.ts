import { Logger } from "../common/logger";

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: "fixed" | "exponential" | "linear";
  maxDelay?: number;
  retryCondition?: (error: unknown) => boolean;
}

export function Retry(options: RetryOptions = {}) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;
    const logger = new Logger(target.constructor.name);

    const {
      maxAttempts = 3,
      delay = 1000,
      backoff = "exponential",
      maxDelay = 30000,
      retryCondition = () => true,
    } = options;

    descriptor.value = async function (...args: any[]) {
      let lastError: unknown;
      let currentDelay = delay;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await method.apply(this, args);
        } catch (error: unknown) {
          lastError = error;

          if (attempt === maxAttempts || !retryCondition(error)) {
            throw error;
          }

          const errorMessage =
            error instanceof Error ? error.message : String(error);
          logger.warn(
            `Attempt ${attempt} failed for ${propertyName}, retrying in ${currentDelay}ms`,
            {
              error: errorMessage,
              attempt,
              maxAttempts,
            }
          );

          await sleep(currentDelay);

          // Calculate next delay based on backoff strategy
          switch (backoff) {
            case "exponential":
              currentDelay = Math.min(currentDelay * 2, maxDelay);
              break;
            case "linear":
              currentDelay = Math.min(currentDelay + delay, maxDelay);
              break;
            case "fixed":
            default:
              // Keep current delay
              break;
          }
        }
      }

      throw lastError;
    };
  };
}

export function RetryAsync(options: RetryOptions = {}) {
  return Retry(options);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Predefined retry conditions
export const RetryConditions = {
  networkError: (error: unknown) => {
    const networkErrors = [
      "ECONNRESET",
      "ENOTFOUND",
      "ECONNREFUSED",
      "ETIMEDOUT",
    ];
    const message = error instanceof Error ? error.message : "";
    const code = (error as any)?.code;
    return networkErrors.some((c) => code === c || message.includes(c));
  },

  httpError: (error: unknown) => {
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    const status = (error as any)?.status ?? (error as any)?.statusCode;
    return retryableStatusCodes.includes(status);
  },

  databaseError: (error: unknown) => {
    const dbErrors = ["connection", "timeout", "deadlock"];
    const message = (error as any)?.message?.toLowerCase?.() ?? "";
    return dbErrors.some((keyword) => message.includes(keyword));
  },

  never: () => false,
  always: () => true,
};
