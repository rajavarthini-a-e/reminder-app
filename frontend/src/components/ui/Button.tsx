import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'success' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled = false,
  children,
  ...rest
}) => {
  const variantStyles: Record<ButtonVariant, string> = {
    // Primary Brand action (Violet / Lavender)
    primary:
      'bg-primary hover:bg-primary-hover active:bg-primary-hover text-white shadow-soft hover:-translate-y-0.5 active:translate-y-0 focus:ring-2 focus:ring-primary/40',
    // Success CTA (Forest Sage Green - primary action button, 6.44:1 contrast)
    success:
      'bg-success hover:bg-success-hover active:bg-success-active text-white shadow-soft hover:-translate-y-0.5 active:translate-y-0 focus:ring-2 focus:ring-success/40',
    // Secondary White with colored border
    secondary:
      'bg-surface hover:bg-surface-secondary text-primary-text dark:text-gray-200 border border-border dark:border-surface-darkBorder shadow-subtle hover:-translate-y-0.5 active:translate-y-0',
    // Outline style (e.g. white outlined Snooze button)
    outline:
      'bg-transparent hover:bg-surface-secondary text-primary-text dark:text-gray-200 border border-border dark:border-surface-darkBorder',
    // Danger soft red
    danger:
      'bg-danger-soft hover:bg-danger text-danger hover:text-white border border-danger/20 shadow-subtle',
    // Ghost
    ghost:
      'bg-transparent hover:bg-surface-secondary text-secondary-text hover:text-primary-text',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'py-2 px-3.5 text-xs font-semibold rounded-xl min-h-[44px] sm:min-h-[40px]',
    md: 'py-2.5 px-4 text-xs sm:text-sm font-bold rounded-2xl min-h-[48px]',
    lg: 'py-3.5 px-6 text-sm sm:text-base font-bold rounded-2xl min-h-[52px]',
  };

  const isInactive = disabled || isLoading;

  return (
    <motion.button
      whileTap={isInactive ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.1 }}
      disabled={isInactive}
      className={clsx(
        'inline-flex items-center justify-center gap-2 select-none outline-none font-sans transition-all duration-150 cursor-pointer',
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && 'w-full',
        isInactive && 'opacity-50 cursor-not-allowed hover:transform-none shadow-none',
        className
      )}
      {...rest}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
      ) : (
        icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!isLoading && icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </motion.button>
  );
};

export default Button;
