import React from 'react';
import { cn } from '../../lib/utils';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps {
  src?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  className?: string;
  alt?: string;
}

const sizeClasses: Record<AvatarSize, { container: string; text: string; status: string }> = {
  xs: { container: 'h-6 w-6',  text: 'text-xs',    status: 'h-1.5 w-1.5 -bottom-0 -right-0' },
  sm: { container: 'h-8 w-8',  text: 'text-xs',    status: 'h-2 w-2 bottom-0 right-0' },
  md: { container: 'h-10 w-10', text: 'text-sm',   status: 'h-2.5 w-2.5 bottom-0 right-0' },
  lg: { container: 'h-12 w-12', text: 'text-base', status: 'h-3 w-3 bottom-0 right-0' },
  xl: { container: 'h-16 w-16', text: 'text-xl',   status: 'h-3.5 w-3.5 bottom-0.5 right-0.5' },
};

const statusColors: Record<AvatarStatus, string> = {
  online:  'bg-green-500',
  offline: 'bg-gray-400',
  busy:    'bg-red-500',
  away:    'bg-yellow-400',
};

function getInitials(firstName?: string, lastName?: string, name?: string): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (name) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  return '?';
}

function getColorFromName(firstName?: string, lastName?: string, name?: string): string {
  const str = firstName || name || '';
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
    'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  firstName,
  lastName,
  name,
  size = 'md',
  status,
  className,
  alt,
}) => {
  const sizes = sizeClasses[size];
  const initials = getInitials(firstName, lastName, name);
  const bgColor = getColorFromName(firstName, lastName, name);
  const displayName = alt || [firstName, lastName].filter(Boolean).join(' ') || name || 'User';

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center select-none',
          sizes.container,
          !src && bgColor
        )}
      >
        {src ? (
          <img src={src} alt={displayName} className="h-full w-full object-cover" />
        ) : (
          <span className={cn('font-semibold text-white', sizes.text)} aria-hidden="true">
            {initials}
          </span>
        )}
      </div>
      {status && (
        <span
          aria-label={`Status: ${status}`}
          className={cn(
            'absolute rounded-full ring-2 ring-white',
            sizes.status,
            statusColors[status]
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
