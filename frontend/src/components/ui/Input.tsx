import React from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  disabled,
  ...rest
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left font-sans">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-text-primary dark:text-gray-200">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3.5 text-text-secondary pointer-events-none">
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          disabled={disabled}
          className={clsx(
            'w-full min-h-[48px] px-4 rounded-xl bg-surface-secondary dark:bg-surface-darkCard border text-sm text-text-primary dark:text-gray-100 placeholder:text-text-secondary/60 outline-none transition-all',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error
              ? 'border-danger focus:ring-2 focus:ring-danger-soft'
              : 'border-border dark:border-surface-darkBorder focus:border-success focus:ring-2 focus:ring-success-soft',
            disabled && 'opacity-50 cursor-not-allowed bg-surface/50',
            className
          )}
          {...rest}
        />

        {rightIcon && (
          <span className="absolute right-3.5 text-text-secondary">
            {rightIcon}
          </span>
        )}
      </div>

      {error ? (
        <p className="text-xs font-semibold text-danger">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-text-secondary">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
