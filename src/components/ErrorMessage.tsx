import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = '出现错误',
  message,
  onRetry,
  onDismiss,
  variant = 'error',
  className = ''
}) => {
  const variantStyles = {
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      icon: 'text-red-400',
      text: 'text-red-400',
      button: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      icon: 'text-yellow-400',
      text: 'text-yellow-400',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      icon: 'text-blue-400',
      text: 'text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`w-5 h-5 ${styles.icon} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${styles.text} mb-1`}>
            {title}
          </h3>
          <p className="text-gray-300 text-sm">
            {message}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className={`inline-flex items-center gap-1 ${styles.button} text-white px-3 py-1.5 rounded text-sm font-medium transition-colors`}
            >
              <RefreshCw className="w-3 h-3" />
              <span>重试</span>
            </button>
          )}
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;