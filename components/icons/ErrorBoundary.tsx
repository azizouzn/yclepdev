import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100 text-red-600 p-8">
          <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong.</h1>
          <p className="text-lg text-gray-600 mb-6">An unexpected error occurred while trying to render this page.</p>
          <details className="bg-gray-200 p-4 rounded-lg w-full max-w-2xl text-left">
            <summary className="cursor-pointer font-medium text-gray-700">Error Details</summary>
            <pre className="mt-2 text-sm whitespace-pre-wrap text-gray-800">
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.error?.stack}
            </pre>
          </details>
           <button 
                onClick={this.handleReload} 
                className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            >
              Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;