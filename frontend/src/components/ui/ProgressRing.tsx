import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export type ProgressRingSize = 'sm' | 'md' | 'lg';
export type ProgressRingColor = 'success' | 'primary' | 'warning' | 'danger' | 'sage' | 'lavender' | 'amber' | 'coral';

export interface ProgressRingProps {
  value: number; // 0 to 100
  size?: ProgressRingSize;
  color?: ProgressRingColor;
  label?: string;
  sublabel?: string;
  showValueText?: boolean;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 'md',
  color = 'success',
  label,
  sublabel,
  showValueText = true,
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, Math.round(value)));

  const sizeConfig = {
    sm: { dimension: 64, stroke: 6, textClass: 'text-sm font-bold', labelClass: 'text-[10px]' },
    md: { dimension: 120, stroke: 10, textClass: 'text-2xl font-extrabold', labelClass: 'text-xs' },
    lg: { dimension: 160, stroke: 12, textClass: 'text-4xl font-extrabold', labelClass: 'text-sm' },
  };

  const { dimension, stroke, textClass, labelClass } = sizeConfig[size];
  const radius = (dimension - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  const colorConfig: Record<string, { stroke: string; track: string }> = {
    success: { stroke: 'stroke-success', track: 'stroke-success-soft' },
    sage: { stroke: 'stroke-success', track: 'stroke-success-soft' },
    primary: { stroke: 'stroke-primary', track: 'stroke-lavender' },
    lavender: { stroke: 'stroke-primary', track: 'stroke-lavender' },
    warning: { stroke: 'stroke-warning', track: 'stroke-warning-soft' },
    amber: { stroke: 'stroke-warning', track: 'stroke-warning-soft' },
    danger: { stroke: 'stroke-danger', track: 'stroke-danger-soft' },
    coral: { stroke: 'stroke-danger', track: 'stroke-danger-soft' },
  };

  const colors = colorConfig[color] || colorConfig.success;

  return (
    <div
      className={clsx('flex flex-col items-center justify-center', className)}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || `${clampedValue}% progress`}
    >
      <div className="relative flex items-center justify-center" style={{ width: dimension, height: dimension }}>
        <svg
          width={dimension}
          height={dimension}
          viewBox={`0 0 ${dimension} ${dimension}`}
          className="transform -rotate-90"
        >
          {/* Background Track */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="transparent"
            strokeWidth={stroke}
            className={colors.track}
          />
          {/* Animated Progress Fill */}
          <motion.circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: [0.2, 0.0, 0, 1] }}
            strokeLinecap="round"
            className={colors.stroke}
          />
        </svg>

        {/* Center Text */}
        {showValueText && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
            <span className={clsx('tabular-nums text-text-primary dark:text-gray-100', textClass)}>
              {clampedValue}%
            </span>
            {sublabel && (
              <span className={clsx('text-text-secondary font-medium mt-0.5', labelClass)}>
                {sublabel}
              </span>
            )}
          </div>
        )}
      </div>

      {label && (
        <span className={clsx('text-text-primary font-bold mt-2 text-center', labelClass)}>
          {label}
        </span>
      )}
    </div>
  );
};

export default ProgressRing;
