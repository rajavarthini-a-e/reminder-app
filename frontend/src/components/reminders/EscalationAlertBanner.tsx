import React from 'react';
import {
  Moon,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.js';
import { Task } from '@shared/types';
import clsx from 'clsx';

export const EscalationAlertBanner: React.FC = () => {
  const {
    activeReminders,
    acknowledgeReminder,
    snoozeTask,
    openVerification,
    dashboardData,
  } = useAppStore();

  if (activeReminders.length === 0) return null;

  const topReminder = activeReminders[0];

  const targetTask =
    dashboardData?.todayTasks.find((t) => t.id === topReminder.taskId) ||
    dashboardData?.todayMission ||
    ({
      id: topReminder.taskId,
      title: 'Active Mission',
      verificationType: 'LEARNING',
      estimatedMinutes: 45,
      priority: 'HIGH',
    } as Task);

  return (
    <div className="w-full max-w-xl mx-auto px-4 pt-3 transition-all animate-fadeIn">
      {/* Critical Alert Card (Mockup Screen 14) */}
      <div className="rounded-2xl p-4 bg-danger-soft border-2 border-danger text-danger-text shadow-xs space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🚨</span>
            <div className="space-y-0.5 min-w-0">
              <div className="text-sm font-black text-danger-text break-words">
                Time to execute
              </div>
              <div className="text-xs font-semibold text-danger-text leading-relaxed break-words">
                {topReminder.message || 'Milestone review is due tonight — this one can’t wait.'}
              </div>
            </div>
          </div>

          <button
            onClick={() => acknowledgeReminder(topReminder.id)}
            className="p-2 text-danger-text hover:opacity-75 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer"
            title="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons (Mockup Screen 14) */}
        <div className="flex gap-2.5 pt-1">
          <button
            onClick={() => openVerification(targetTask)}
            className="flex-1 min-h-[48px] py-3 px-4 rounded-xl bg-success text-white hover:bg-success-hover font-black text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verify now</span>
          </button>

          <button
            onClick={() => snoozeTask(targetTask.id, 15)}
            className="flex-1 min-h-[48px] py-3 px-4 rounded-xl bg-surface-secondary text-primary-text hover:bg-border font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Moon className="w-4 h-4 text-warning" />
            <span>Snooze 15m</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EscalationAlertBanner;
