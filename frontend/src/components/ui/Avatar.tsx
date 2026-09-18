import React from 'react';
import { User } from 'lucide-react';
import clsx from 'clsx';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: AvatarSize;
  status?: 'online' | 'offline' | 'busy';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  status,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  const statusSizeMap = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
  };

  const getInitials = (n?: string) => {
    if (!n) return '';
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <div className={clsx('relative inline-flex items-center justify-center flex-shrink-0', className)}>
      <div
        className={clsx(
          'rounded-full overflow-hidden flex items-center justify-center font-bold select-none border border-border shadow-subtle',
          sizeMap[size],
          src ? 'bg-surface' : 'bg-lavender dark:bg-lavender-dark text-primary'
        )}
      >
        {src ? (
          <img src={src} alt={name || 'User avatar'} className="w-full h-full object-cover" />
        ) : initials ? (
          <span>{initials}</span>
        ) : (
          <User className="w-1/2 h-1/2 text-text-secondary" />
        )}
      </div>

      {status && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-surface',
            statusSizeMap[size],
            status === 'online' ? 'bg-success' : status === 'busy' ? 'bg-warning' : 'bg-disabled'
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
