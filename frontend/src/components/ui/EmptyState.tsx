import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card } from './Card.js';
import { Button } from './Button.js';
import { Mascot } from './Mascot.js';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  illustration?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  illustration,
  title,
  description,
  actionLabel,
  actionText,
  actionLink,
  onAction,
  className = '',
}) => {
  const displayLabel = actionLabel || actionText;
  const visualElement = illustration || icon || <Mascot pose="encouraging" className="w-28 h-28 sm:w-32 sm:h-32" />;

  return (
    <Card className={`p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="flex items-center justify-center mb-1">
        {visualElement}
      </div>

      <div className="max-w-md space-y-1.5">
        <h3 className="text-xl font-bold text-text-primary dark:text-white tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-text-secondary dark:text-gray-300 leading-relaxed">
          {description}
        </p>
      </div>

      {displayLabel && (
        <div className="pt-2">
          {actionLink ? (
            <Link to={actionLink}>
              <Button variant="success" size="lg" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                {displayLabel}
              </Button>
            </Link>
          ) : (
            <Button variant="success" size="lg" onClick={onAction} icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
              {displayLabel}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default EmptyState;
