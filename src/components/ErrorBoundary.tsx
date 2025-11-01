import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">出现了一些问题</h1>
            
            <p className="text-gray-400 mb-8">
              应用程序遇到了意外错误。请尝试刷新页面，如果问题持续存在，请联系技术支持。
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-sm font-medium text-red-400 mb-2">错误详情：</h3>
                <pre className="text-xs text-gray-300 overflow-auto">
                  {this.state.error.message}
                </pre>
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>刷新页面</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;