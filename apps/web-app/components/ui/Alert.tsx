import { ReactNode } from 'react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  children: ReactNode;
  className?: string;
}

const variantStyles = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error: 'bg-red-50 border-red-200 text-red-800',
};

export function Alert({ variant = 'info', children, className = '' }: AlertProps) {
  return (
    <div className={`p-4 rounded-lg border ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}
