import React from 'react';
import clsx from 'clsx';

// 1. Stack Primitive
export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col';
  gap?: '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Stack: React.FC<StackProps> = ({
  direction = 'col',
  gap = '4',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className = '',
  children,
  ...rest
}) => {
  const gapMap = {
    '1': 'gap-1',
    '2': 'gap-2',
    '3': 'gap-3',
    '4': 'gap-4',
    '5': 'gap-5',
    '6': 'gap-6',
    '8': 'gap-8',
    '10': 'gap-10',
    '12': 'gap-12',
  };

  const alignMap = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  const justifyMap = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  return (
    <div
      className={clsx(
        'flex',
        direction === 'col' ? 'flex-col' : 'flex-row',
        gapMap[gap],
        alignMap[align],
        justifyMap[justify],
        wrap && 'flex-wrap',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

// 2. Grid Primitive
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4;
  mdCols?: 1 | 2 | 3 | 4;
  lgCols?: 1 | 2 | 3 | 4;
  gap?: '2' | '3' | '4' | '6' | '8';
  className?: string;
  children: React.ReactNode;
}

export const Grid: React.FC<GridProps> = ({
  cols = 1,
  mdCols,
  lgCols,
  gap = '6',
  className = '',
  children,
  ...rest
}) => {
  const colsMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  const mdColsMap = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  };

  const lgColsMap = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
  };

  const gapMap = {
    '2': 'gap-2',
    '3': 'gap-3',
    '4': 'gap-4',
    '6': 'gap-6',
    '8': 'gap-8',
  };

  return (
    <div
      className={clsx(
        'grid',
        colsMap[cols],
        mdCols && mdColsMap[mdCols],
        lgCols && lgColsMap[lgCols],
        gapMap[gap],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

// 3. Centered Desktop Container
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({
  className = '',
  children,
  ...rest
}) => {
  return (
    <div
      className={clsx(
        'w-full max-w-content mx-auto px-4 sm:px-6 lg:px-8',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

// 4. Safe Area Container
export interface SafeAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  top?: boolean;
  bottom?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const SafeArea: React.FC<SafeAreaProps> = ({
  top = false,
  bottom = false,
  className = '',
  children,
  ...rest
}) => {
  return (
    <div
      className={clsx(
        top && 'pt-safe',
        bottom && 'pb-20 md:pb-6', // Accommodates mobile bottom navigation
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default { Stack, Grid, Container, SafeArea };
