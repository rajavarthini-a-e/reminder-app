import React from 'react';
import clsx from 'clsx';

export interface SegmentedOption<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className={clsx(
        'p-1 bg-surface-secondary dark:bg-surface-darkCard rounded-2xl border border-border inline-flex items-center gap-1 select-none',
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.id === value;
        return (
          <button
            key={option.id}
            role="tab"
            aria-selected={isSelected}
            type="button"
            onClick={() => onChange(option.id)}
            className={clsx(
              'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer min-h-[40px]',
              isSelected
                ? 'bg-surface dark:bg-surface-dark text-primary-text dark:text-gray-100 shadow-subtle'
                : 'text-secondary-text hover:text-primary-text'
            )}
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
