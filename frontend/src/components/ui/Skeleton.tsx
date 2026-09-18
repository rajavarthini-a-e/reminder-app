import React from 'react';
import clsx from 'clsx';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'circle' | 'button';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
}) => {
  const variantStyles = {
    text: 'h-4 w-full rounded-md',
    card: 'h-32 w-full rounded-card',
    circle: 'w-12 h-12 rounded-full',
    button: 'h-11 w-32 rounded-xl',
  };

  return (
    <div
      aria-hidden="true"
      style={{ width, height }}
      className={clsx(
        'animate-pulse bg-surface-secondary dark:bg-surface-darkCard',
        variantStyles[variant],
        className
      )}
    />
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse max-w-content mx-auto">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="text" className="w-48 h-8 rounded-xl" />
          <Skeleton variant="text" className="w-32 h-4 rounded-lg" />
        </div>
        <Skeleton variant="button" className="w-28 h-10 rounded-full" />
      </div>

      {/* Hero skeleton */}
      <Skeleton variant="card" className="h-56 rounded-card" />

      {/* 2-col skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton variant="card" className="h-64 rounded-card" />
        <Skeleton variant="card" className="h-64 rounded-card" />
      </div>
    </div>
  );
};

export default Skeleton;
