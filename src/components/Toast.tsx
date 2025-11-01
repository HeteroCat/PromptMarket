import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 显示动画
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // 自动关闭
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      iconColor: 'text-green-400',
      titleColor: 'text-green-400'
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      iconColor: 'text-red-400',
      titleColor: 'text-red-400'
    },
    info: {
      icon: Info,
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-400'
    }
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <div
      className={`
        ${config.bg} ${config.border} border rounded-lg p-4 shadow-lg backdrop-blur-sm
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-start gap-3">
        <IconComponent className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${config.titleColor} mb-1`}>
            {title}
          </h4>
          {message && (
            <p className="text-gray-300 text-sm">
              {message}
            </p>
          )}
        </div>

        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-300 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;