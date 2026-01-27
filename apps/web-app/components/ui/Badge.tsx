import React from 'react';
import { clsx } from 'clsx';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
    const variantClasses: Record<BadgeVariant, string> = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    return (
        <span
            className={clsx(
                'inline-flex items-center font-medium rounded-full',
                variantClasses[variant],
                sizeClasses[size],
                className
            )}
        >
            {children}
        </span>
    );
}

export function getStatusBadgeVariant(
    status: string
): BadgeVariant {
    const statusMap: Record<string, BadgeVariant> = {
        PENDING: 'warning',
        VERIFIED: 'success',
        REJECTED: 'danger',
        UNDER_REVIEW: 'info',
        DRAFT: 'default',
        PUBLISHED: 'success',
        CLOSED: 'default',
        APPLIED: 'info',
        SHORTLISTED: 'info',
        REJECTED_APP: 'danger',
        ACCEPTED: 'success',
        WITHDRAWN: 'default',
        COMPLETED: 'success',
        FUNDS_HELD: 'warning',
        RELEASED: 'success',
        REFUNDED: 'info',
    };
    return statusMap[status] || 'default';
}
