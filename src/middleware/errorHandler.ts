/**
 * Error Handler Middleware
 *
 * Provides unified error handling for async operations
 * Wraps functions with consistent error logging and fallback values
 */

import { logger } from '../shared/logger';
import { GlobalErrorHandler } from '../main/errorHandler';

export type Operation<T> = () => Promise<T> | T;

export interface ErrorHandlerOptions {
  context: string;
  fallback?: any;
  rethrow?: boolean;
  silent?: boolean;
}

/**
 * Error Handler Middleware Class
 */
export class ErrorHandlerMiddleware {
  /**
   * Handle async operations with error catching
   * @param operation - The async operation to execute
   * @param options - Error handling options
   * @returns Promise with result or fallback value
   */
  static async handleAsync<T>(
    operation: () => Promise<T>,
    options: ErrorHandlerOptions
  ): Promise<T | undefined> {
    const { context, fallback, rethrow = false, silent = false } = options;

    try {
      return await operation();
    } catch (error) {
      if (!silent) {
        GlobalErrorHandler.logError(context, error);
      }

      if (rethrow) {
        throw error;
      }

      return fallback;
    }
  }

  /**
   * Handle sync operations with error catching
   * @param operation - The sync operation to execute
   * @param options - Error handling options
   * @returns Result or fallback value
   */
  static handleSync<T>(
    operation: () => T,
    options: ErrorHandlerOptions
  ): T | undefined {
    const { context, fallback, rethrow = false, silent = false } = options;

    try {
      return operation();
    } catch (error) {
      if (!silent) {
        GlobalErrorHandler.logError(context, error);
      }

      if (rethrow) {
        throw error;
      }

      return fallback;
    }
  }

  /**
   * Wrapper for IPC handlers with automatic error handling
   * @param handler - The IPC handler function
   * @param context - Context description for logging
   * @returns Wrapped handler function
   */
  static wrapIPCHandler<T extends (...args: any[]) => Promise<any>>(
    handler: T,
    context: string
  ): T {
    return (async (...args: Parameters<T>) => {
      try {
        return await handler(...args);
      } catch (error) {
        GlobalErrorHandler.logError(`${context} (IPC)`, error, { args });
        throw error; // Re-throw to send error back to renderer
      }
    }) as T;
  }

  /**
   * Batch error handler for multiple operations
   * Executes all operations and collects errors
   */
  static async handleBatch<T>(
    operations: Array<{ name: string; operation: Operation<T> }>
  ): Promise<{
    results: Array<{ name: string; success: boolean; data?: T; error?: any }>;
  }> {
    const results = await Promise.allSettled(
      operations.map(async (op) => {
        try {
          const data = await op.operation();
          return { name: op.name, success: true, data };
        } catch (error) {
          GlobalErrorHandler.logError(`Batch operation: ${op.name}`, error);
          return { name: op.name, success: false, error };
        }
      })
    );

    return {
      results: results.map((result) =>
        result.status === 'fulfilled'
          ? result.value
          : { name: 'unknown', success: false, error: result.reason }
      ),
    };
  }

  /**
   * Retry handler for operations that might fail temporarily
   */
  static async retry<T>(
    operation: () => Promise<T>,
    options: {
      context: string;
      maxRetries?: number;
      delay?: number;
      backoff?: boolean;
    } & ErrorHandlerOptions
  ): Promise<T | undefined> {
    const { context, maxRetries = 3, delay = 1000, backoff = true, ...errorOptions } = options;

    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries - 1) {
          const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
          logger.warn(`[ErrorHandler] Retry ${attempt + 1}/${maxRetries} for ${context}`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }

    GlobalErrorHandler.logError(`${context} (after ${maxRetries} retries)`, lastError);
    return errorOptions.fallback;
  }
}

/**
 * Decorator for automatic error handling in class methods
 */
export function HandleErrors(options: Omit<ErrorHandlerOptions, 'context'>) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        GlobalErrorHandler.logError(`${className}.${propertyKey}`, error, { args });

        if (options.rethrow) {
          throw error;
        }

        return options.fallback;
      }
    };

    return descriptor;
  };
}

/**
 * Higher-order function for React components error handling
 * Note: For full implementation, use the ErrorBoundary component directly
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function withErrorBoundary<P extends object>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Component: React.ComponentType<P>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
): React.ComponentType<P> {
  // This is a placeholder - use ErrorBoundary component directly instead
  throw new Error('withErrorBoundary is not implemented. Use ErrorBoundary component directly.');
}

export default ErrorHandlerMiddleware;
