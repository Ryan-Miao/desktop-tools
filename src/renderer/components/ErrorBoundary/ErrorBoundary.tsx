/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the component tree,
 * logs those errors, and displays a fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../../../shared/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to logger
    logger.error('[ErrorBoundary] Caught an error', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Store error info in state for display
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  override render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo, onReset }) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      padding: '2rem',
      backgroundColor: 'var(--background)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-body)',
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
      }}>
        {/* Error Icon */}
        <div style={{
          fontSize: '4rem',
          marginBottom: '1rem',
          opacity: 0.6,
        }}>
          ⚠️
        </div>

        {/* Error Message */}
        <h1 style={{
          fontSize: '1.5rem',
          marginBottom: '1rem',
          color: 'var(--error, #DC3545)',
        }}>
          Something went wrong
        </h1>

        <p style={{
          fontSize: '1rem',
          marginBottom: '2rem',
          lineHeight: '1.6',
          color: 'var(--text-secondary)',
        }}>
          {error?.message || 'An unexpected error occurred. Please try refreshing the application.'}
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          marginBottom: '2rem',
        }}>
          <button
            onClick={onReset}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground, white)',
              border: 'none',
              borderRadius: 'var(--radius-md, 8px)',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Try Again
          </button>

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--secondary)',
              color: 'var(--secondary-foreground, white)',
              border: 'none',
              borderRadius: 'var(--radius-md, 8px)',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Reload Application
          </button>
        </div>

        {/* Error Details (Development Only) */}
        {isDevelopment && error && (
          <details style={{
            textAlign: 'left',
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border)',
          }}>
            <summary style={{
              cursor: 'pointer',
              fontWeight: 'bold',
              marginBottom: '1rem',
            }}>
              Error Details (Development)
            </summary>

            <div style={{
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>
              <strong>Error:</strong> {error.name}: {error.message}
              {'\n\n'}
              <strong>Stack Trace:</strong>
              {'\n'}
              {error.stack}
              {'\n\n'}
              {errorInfo && (
                <>
                  <strong>Component Stack:</strong>
                  {'\n'}
                  {errorInfo.componentStack}
                </>
              )}
            </div>
          </details>
        )}

        {/* Help Text */}
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-tertiary)',
          marginTop: '2rem',
        }}>
          If this problem persists, please check the console logs or contact support.
        </p>
      </div>
    </div>
  );
};

export default ErrorBoundary;
