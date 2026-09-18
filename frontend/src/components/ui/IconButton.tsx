import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  'aria-label': ariaLabel,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  ...rest
}) => {
  const variantStyles: Record<IconButtonVariant, string> = {
    primary:
      'bg-success hover:bg-success-hover text-white shadow-soft hover:-translate-y-0.5 active:translate-y-0 focus:ring-2 focus:ring-success/40',
    secondary:
      'bg-surface hover:bg-surface-secondary text-primary-text dark:text-gray-200 border border-border dark:border-surface-darkBorder shadow-subtle hover:-translate-y-0.5 active:translate-y-0',
    ghost:
      'bg-transparent hover:bg-surface-secondary text-secondary-text hover:text-primary-text active:scale-95',
    destructive:
      'bg-danger-soft hover:bg-danger text-danger hover:text-white border border-danger/20 shadow-subtle',
  };

  // Ensure minimum 48px touch target on mobile using min-h-[48px] / min-w-[48px]
  const sizeStyles: Record<IconButtonSize, string> = {
    sm: 'w-10 h-10 min-w-[48px] min-h-[48px] rounded-xl text-xs',
    md: 'w-11 h-11 min-w-[48px] min-h-[48px] rounded-2xl text-sm',
    lg: 'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl text-base',
  };

  const isInactive = disabled || isLoading;

  return (
    <motion.button
      whileTap={isInactive ? undefined : { scale: 0.95 }}
      transition={{ duration: 0.1 }}
      disabled={isInactive}
      aria-label={ariaLabel}
      className={clsx(
        'inline-flex items-center justify-center p-0 select-none outline-none transition-all duration-150',
        sizeStyles[size],
        variantStyles[variant],
        isInactive && 'opacity-50 cursor-not-allowed hover:transform-none shadow-none',
        className
      )}
      {...rest}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
    </motion.button>
  );
};

export default IconButton;
