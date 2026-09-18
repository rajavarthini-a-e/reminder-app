import React from 'react';
import clsx from 'clsx';

export type HeadingVariant = 'display' | 'titleLg' | 'title' | 'heading';
export type TextVariant = 'bodyLg' | 'body' | 'label' | 'caption' | 'numeric';
export type TextTone = 'primary' | 'secondary' | 'tertiary' | 'sage' | 'amber' | 'critical' | 'inverse';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  variant?: HeadingVariant;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
  tone?: TextTone;
  className?: string;
  children: React.ReactNode;
}

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement | HTMLSpanElement> {
  variant?: TextVariant;
  as?: 'p' | 'span' | 'div' | 'label';
  tone?: TextTone;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  tabular?: boolean;
  className?: string;
  children: React.ReactNode;
}

const toneMap: Record<TextTone, string> = {
  primary: 'text-primary-text dark:text-gray-100',
  secondary: 'text-secondary-text dark:text-gray-400',
  tertiary: 'text-disabled dark:text-gray-500',
  sage: 'text-success dark:text-sage-light',
  amber: 'text-warning dark:text-amber-light',
  critical: 'text-danger dark:text-danger-light',
  inverse: 'text-white dark:text-gray-900',
};

export const Heading: React.FC<HeadingProps> = ({
  variant = 'title',
  as,
  tone = 'primary',
  className = '',
  children,
  ...rest
}) => {
  const variantMap: Record<HeadingVariant, { tag: 'h1' | 'h2' | 'h3' | 'h4'; styles: string }> = {
    display: {
      tag: 'h1',
      styles: 'text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight',
    },
    titleLg: {
      tag: 'h2',
      styles: 'text-xl sm:text-2xl font-bold tracking-tight leading-snug',
    },
    title: {
      tag: 'h3',
      styles: 'text-lg sm:text-xl font-bold tracking-normal leading-snug',
    },
    heading: {
      tag: 'h4',
      styles: 'text-base sm:text-lg font-semibold tracking-normal leading-normal',
    },
  };

  const { tag: defaultTag, styles } = variantMap[variant];
  const Component = as || defaultTag;

  return (
    <Component className={clsx('font-sans', styles, toneMap[tone], className)} {...rest}>
      {children}
    </Component>
  );
};

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  as: Component = 'p',
  tone = 'primary',
  weight,
  tabular = false,
  className = '',
  children,
  ...rest
}) => {
  const variantStyles: Record<TextVariant, string> = {
    bodyLg: 'text-base sm:text-lg leading-relaxed',
    body: 'text-sm sm:text-base leading-normal',
    label: 'text-xs sm:text-sm font-semibold leading-normal',
    caption: 'text-xs leading-normal',
    numeric: 'text-sm sm:text-base font-bold tabular-nums tracking-tight',
  };

  const weightStyles = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  return (
    <Component
      className={clsx(
        'font-sans',
        variantStyles[variant],
        weight && weightStyles[weight],
        tabular && 'tabular-nums',
        toneMap[tone],
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default { Heading, Text };
