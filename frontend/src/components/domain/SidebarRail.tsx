import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Sprout,
  MessageSquare,
  CalendarDays,
  BookOpen,
  User,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import clsx from 'clsx';

export const SidebarRail: React.FC = () => {
  const location = useLocation();
  const { dashboardData, isSoundMuted, toggleSound, theme, toggleTheme } = useAppStore();

  // Persist pinned state in localStorage
  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem('mentor_sidebar_pinned') === 'true';
  });
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isPinned || isHovered;

  const togglePin = () => {
    const next = !isPinned;
    setIsPinned(next);
    localStorage.setItem('mentor_sidebar_pinned', String(next));
  };

  const streak = dashboardData?.streak?.current || 0;

  interface SidebarNavItem {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const navItems: SidebarNavItem[] = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/progress', label: 'Progress', icon: Sprout },
    { to: '/mentor', label: 'Mentor', icon: MessageSquare },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/library', label: 'My Roadmaps', icon: BookOpen },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Desktop navigation sidebar"
      className={clsx(
        'hidden md:flex flex-col flex-shrink-0 z-30 bg-surface dark:bg-surface-dark border-r border-border dark:border-surface-darkBorder transition-all duration-300 ease-out shadow-subtle min-h-screen sticky top-0',
        isExpanded ? 'w-60' : 'w-18'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 justify-between border-b border-border/60 dark:border-surface-darkBorder/60">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden select-none">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-soft flex-shrink-0">
            <Sparkles className="w-5 h-5 stroke-[2.4]" />
          </div>
          {isExpanded && (
            <div className="flex flex-col whitespace-nowrap overflow-hidden">
              <span className="font-extrabold text-base tracking-tight text-primary-text dark:text-gray-100">
                MentorAI
              </span>
              <span className="text-[10px] text-secondary-text font-bold uppercase tracking-wider">
                Personal Mentor
              </span>
            </div>
          )}
        </NavLink>

        {isExpanded && (
          <button
            onClick={togglePin}
            title={isPinned ? 'Collapse sidebar' : 'Pin sidebar'}
            className="p-1.5 rounded-xl text-secondary-text hover:text-primary-text hover:bg-surface-secondary transition-colors cursor-pointer"
          >
            {isPinned ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Streak Widget */}
      {streak > 0 && (
        <div className="px-3 pt-4">
          <div
            className={clsx(
              'rounded-2xl p-2.5 bg-warning-soft border border-warning/30 flex items-center gap-2.5 shadow-subtle transition-all',
              !isExpanded && 'justify-center p-2'
            )}
            title={`${streak} Day Streak`}
          >
            <Flame className="w-5 h-5 text-warning fill-warning flex-shrink-0" />
            {isExpanded && (
              <div className="overflow-hidden">
                <span className="text-xs font-extrabold text-primary-text block truncate">
                  {streak} Day Streak
                </span>
                <span className="text-[10px] text-secondary-text font-medium block">
                  Keep showing up
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={!isExpanded ? item.label : undefined}
              className={clsx(
                'flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-150 select-none min-h-[48px] group cursor-pointer',
                isActive
                  ? 'bg-lavender dark:bg-surface-secondary text-primary dark:text-success font-bold shadow-subtle'
                  : 'text-secondary-text hover:text-primary-text hover:bg-surface-secondary'
              )}
            >
              <div className="relative flex-shrink-0">
                <Icon className={clsx('w-5 h-5', isActive && 'stroke-[2.4]')} />
              </div>

              {isExpanded && (
                <span className="text-sm font-semibold truncate flex-1">
                  {item.label}
                </span>
              )}

              {item.badge && isExpanded && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Controls Footer */}
      <div className="p-3 border-t border-border/60 dark:border-surface-darkBorder/60 space-y-2">
        <div className={clsx('flex items-center gap-1', isExpanded ? 'justify-between' : 'flex-col')}>
          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            aria-label={isSoundMuted ? 'Unmute sounds' : 'Mute sounds'}
            className="p-2.5 rounded-xl text-secondary-text hover:text-primary-text hover:bg-surface-secondary transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            title={isSoundMuted ? 'Unmute audio cues' : 'Mute audio cues'}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4 text-danger" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2.5 rounded-xl text-secondary-text hover:text-primary-text hover:bg-surface-secondary transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to warm dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SidebarRail;
