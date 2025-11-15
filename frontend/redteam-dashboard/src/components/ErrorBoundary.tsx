/**
 * Error boundary component for catching React errors
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-[var(--bg-void)] flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-4 text-[var(--status-failure)]">
              Something Went Wrong
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">
              An unexpected error occurred. Please refresh the page to continue.
            </p>
            {this.state.error && (
              <div className="bg-[var(--bg-elevated)] p-4 rounded font-mono text-xs text-left overflow-auto max-h-40 mb-6">
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
