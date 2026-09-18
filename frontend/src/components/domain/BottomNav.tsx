import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Sprout, MessageSquare, CalendarDays, User } from 'lucide-react';
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
      <div className="flex items-center justify-around px-2 min-h-[64px] h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className={clsx(
                'relative flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 rounded-2xl transition-all duration-150 select-none cursor-pointer',
                isActive
                  ? 'text-primary dark:text-success font-bold'
                  : 'text-secondary-text hover:text-primary-text'
              )}
            >
              {/* Active Pill Indicator Container */}
              <div
                className={clsx(
                  'px-3 py-1.5 rounded-full flex items-center justify-center transition-all min-h-[32px]',
                  isActive && 'bg-lavender dark:bg-surface-secondary'
                )}
              >
                <div className="relative">
                  <Icon className={clsx('w-5 h-5', isActive && 'stroke-[2.5]')} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-danger ring-2 ring-surface" />
                  )}
                </div>
              </div>

              <span className="text-[10px] font-semibold mt-0.5 tracking-tight">
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
