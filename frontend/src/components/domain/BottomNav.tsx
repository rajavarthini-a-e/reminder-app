import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Sprout, MessageSquare, CalendarDays, User } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import clsx from 'clsx';

export interface NavItemConfig {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: boolean;
}

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { activeReminders } = useAppStore();
  const hasReminders = activeReminders.length > 0;

  const navItems: NavItemConfig[] = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/library', label: 'Roadmap', icon: BookOpen },
    { to: '/progress', label: 'Progress', icon: Sprout },
    {
      to: '/mentor',
      label: 'Mentor',
      icon: MessageSquare,
      badge: hasReminders,
    },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 dark:bg-surface-dark/95 backdrop-blur-md border-t border-border dark:border-surface-darkBorder shadow-modal safe-area-pb"
    >
      <div className="flex items-center justify-between px-1 min-h-[60px] h-15 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.to ||
            (item.to === '/library' && location.pathname === '/upload');

          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className={clsx(
                'relative flex flex-col items-center justify-center flex-1 min-w-0 py-1 rounded-xl transition-all duration-150 select-none cursor-pointer',
                isActive
                  ? 'text-primary dark:text-success font-bold'
                  : 'text-secondary-text hover:text-primary-text'
              )}
            >
              {/* Active Pill Indicator Container */}
              <div
                className={clsx(
                  'px-2 py-1 rounded-full flex items-center justify-center transition-all min-h-[28px]',
                  isActive && 'bg-lavender dark:bg-surface-secondary'
                )}
              >
                <div className="relative">
                  <Icon className={clsx('w-4.5 h-4.5 sm:w-5 sm:h-5', isActive && 'stroke-[2.5]')} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-danger ring-2 ring-surface" />
                  )}
                </div>
              </div>

              <span className="text-[9.5px] font-semibold mt-0.5 tracking-tight truncate max-w-full">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
