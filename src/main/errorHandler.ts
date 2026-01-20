/**
 * Global Error Handler for Main Process
 *
 * Catches uncaught exceptions and unhandled promise rejections
 * Logs errors and provides graceful degradation
 */

import { logger } from '../shared/logger';
import { app } from 'electron';

export interface ErrorContext {
  [key: string]: any;
}

export class GlobalErrorHandler {
  private static isSetup = false;

  /**
   * Setup global error handlers
   * Should be called once at application startup
   */
  static setup() {
    if (this.isSetup) {
      logger.warn('[GlobalErrorHandler] Already setup, skipping');
      return;
    }

    this.setupUncaughtExceptionHandler();
    this.setupUnhandledRejectionHandler();

    this.isSetup = true;
    logger.info('[GlobalErrorHandler] Global error handlers registered');
  }

  /**
   * Handle uncaught exceptions
   */
  private static setupUncaughtExceptionHandler() {
    process.on('uncaughtException', (error: Error) => {
      logger.error('[GlobalErrorHandler] Uncaught Exception', {
        error: error.message,
        stack: error.stack,
        name: error.name,
      });

      // In development, show the error and continue
      if (process.env.NODE_ENV === 'development') {
        logger.error('[GlobalErrorHandler] Error details:', error);
        // Don't quit in dev mode to allow debugging
        return;
      }

      // In production, quit after a short delay to allow logs to be written
      setTimeout(() => {
        app.exit(1);
      }, 1000);
    });

    process.on('uncaughtExceptionMonitor', (error: Error) => {
      // This event is emitted before uncaughtException
      // Use it for monitoring/logging without affecting process behavior
      logger.error('[GlobalErrorHandler] Uncaught Exception Monitor', {
        error: error.message,
        stack: error.stack,
      });
    });
  }

  /**
   * Handle unhandled promise rejections
   */
  private static setupUnhandledRejectionHandler() {
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      logger.error('[GlobalErrorHandler] Unhandled Promise Rejection', {
        reason: reason instanceof Error ? {
          message: reason.message,
          stack: reason.stack,
          name: reason.name,
        } : reason,
        promise: promise.toString(),
      });

      // Log additional details in development
      if (process.env.NODE_ENV === 'development') {
        logger.warn('[GlobalErrorHandler] Promise rejection details:', {
          reason,
          promise,
        });
      }

      // Don't exit the app for unhandled rejections
      // They're less critical than uncaught exceptions
    });
  }

  /**
   * Log error with context
   */
  static logError(context: string, error: Error | unknown, additionalContext?: ErrorContext) {
    logger.error(`[GlobalErrorHandler] Error in ${context}`, {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
      ...additionalContext,
    });
  }

  /**
   * Wrap async functions with error handling
   */
  static async handleAsync<T>(
    operation: () => Promise<T>,
    context: string,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      this.logError(context, error);
      return fallback;
    }
  }

  /**
   * Wrap sync functions with error handling
   */
  static handleSync<T>(
    operation: () => T,
    context: string,
    fallback?: T
  ): T | undefined {
    try {
      return operation();
    } catch (error) {
      this.logError(context, error);
      return fallback;
    }
  }
}

/**
 * Decorator for async error handling
 */
export function handleAsyncErrors(context: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        GlobalErrorHandler.logError(
          `${context}.${propertyKey}`,
          error,
          { args }
        );
        throw error; // Re-throw to allow caller to handle
      }
    };

    return descriptor;
  };
}
