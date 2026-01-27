import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, hover = false, padding = 'md' }: CardProps) {
    const paddingClasses = {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            className={clsx(
                'bg-white rounded-lg border border-gray-200 shadow-sm',
                hover && 'transition-shadow hover:shadow-md',
                paddingClasses[padding],
                className
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={clsx('border-b border-gray-200 pb-4 mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
    return <h3 className={clsx('text-lg font-semibold text-gray-900', className)}>{children}</h3>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={clsx(className)}>{children}</div>;
}
