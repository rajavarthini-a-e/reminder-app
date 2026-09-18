import React from 'react';
import { Heading, Text } from '../ui/Typography.js';
import { Badge } from '../ui/Badge.js';
import clsx from 'clsx';

export interface ListSectionProps {
  title: string;
  subtitle?: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ListSection: React.FC<ListSectionProps> = ({
  title,
  subtitle,
  count,
  action,
  children,
  className = '',
}) => {
  return (
    <section className={clsx('space-y-3.5', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heading variant="heading" tone="primary">
            {title}
          </Heading>
          {count !== undefined && (
            <Badge variant="neutral" size="sm">
              {count}
            </Badge>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      {subtitle && (
        <Text variant="caption" tone="secondary">
          {subtitle}
        </Text>
      )}

      <div className="space-y-3">{children}</div>
    </section>
  );
};

export default ListSection;
