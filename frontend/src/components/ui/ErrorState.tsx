import React from 'react';
import { AlertOctagon, RefreshCw, ArrowLeft } from 'lucide-react';
import { Card } from './Card.js';
import { Button } from './Button.js';
import { Badge } from './Badge.js';
import { Heading, Text } from './Typography.js';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  context?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Data',
  message = 'We encountered an issue communicating with your mentor database. Your progress and study records remain safe.',
  context,
  onRetry,
  isRetrying = false,
  onSecondaryAction,
  secondaryActionLabel,
  className = '',
}) => {
  return (
    <Card variant="accent-red" className={`p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-5 ${className}`}>
      {/* Critical Status Icon */}
      <div className="w-16 h-16 rounded-3xl bg-danger-soft border border-danger/30 text-danger flex items-center justify-center shadow-subtle mb-1">
        <AlertOctagon className="w-8 h-8 stroke-[2.2]" />
      </div>

      <div className="max-w-md space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Badge variant="critical" dot>
            Connection Interruption
          </Badge>
          {context && (
            <span className="text-xs font-semibold text-danger">
              {context}
            </span>
          )}
        </div>

        <Heading variant="titleLg" tone="primary">
          {title}
        </Heading>

        <Text variant="body" tone="secondary" className="leading-relaxed">
          {message}
        </Text>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        {onRetry && (
          <Button
            variant="success"
            size="md"
            onClick={onRetry}
            disabled={isRetrying}
            isLoading={isRetrying}
            icon={<RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />}
          >
            Retry Connection
          </Button>
        )}

        {onSecondaryAction && secondaryActionLabel && (
          <Button
            variant="secondary"
            size="md"
            onClick={onSecondaryAction}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ErrorState;
