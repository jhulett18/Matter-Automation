'use client';

type Status = 'idle' | 'testing' | 'processing' | 'running' | 'complete' | 'error';

interface StatusIndicatorProps {
  status: Status;
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  const getStatusConfig = (status: Status) => {
    switch (status) {
      case 'idle':
        return {
          color: 'bg-gray-400 dark:bg-gray-600',
          text: 'Idle',
          textColor: 'text-gray-700 dark:text-gray-300',
          animate: false
        };
      case 'testing':
        return {
          color: 'bg-blue-500',
          text: 'Testing Connection...',
          textColor: 'text-blue-700 dark:text-blue-300',
          animate: true
        };
      case 'processing':
        return {
          color: 'bg-yellow-500',
          text: 'Processing Document...',
          textColor: 'text-yellow-700 dark:text-yellow-300',
          animate: true
        };
      case 'running':
        return {
          color: 'bg-purple-500',
          text: 'Running Automation...',
          textColor: 'text-purple-700 dark:text-purple-300',
          animate: true
        };
      case 'complete':
        return {
          color: 'bg-green-500',
          text: 'Complete',
          textColor: 'text-green-700 dark:text-green-300',
          animate: false
        };
      case 'error':
        return {
          color: 'bg-red-500',
          text: 'Error',
          textColor: 'text-red-700 dark:text-red-300',
          animate: false
        };
      default:
        return {
          color: 'bg-gray-400',
          text: 'Unknown',
          textColor: 'text-gray-700 dark:text-gray-300',
          animate: false
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className={`w-4 h-4 rounded-full ${config.color}`}></div>
        {config.animate && (
          <div className={`absolute inset-0 w-4 h-4 rounded-full ${config.color} animate-ping opacity-75`}></div>
        )}
      </div>
      <span className={`font-medium ${config.textColor}`}>
        {config.text}
      </span>
    </div>
  );
}
