import React, { useState, useEffect } from 'react';
import { X, Check, Bell, BellOff, Clock, RotateCw, Trash2 } from 'lucide-react';
import {
  Routine,
  RoutineDay,
  ReminderFrequencyType,
  ALL_DAYS,
  updateRoutine,
  deleteRoutine,
} from '../../services/routinesService.js';
import { soundService } from '../../services/sound.service.js';
import clsx from 'clsx';

interface EditRoutineModalProps {
  routine: Routine | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const ICONS = ['💧', '🧴', '🧘', '💊', '📖', '🏃', '🍎', '💤'];

export const EditRoutineModal: React.FC<EditRoutineModalProps> = ({
  routine,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💧');
  const [repeatDays, setRepeatDays] = useState<RoutineDay[]>(ALL_DAYS);
  const [frequencyType, setFrequencyType] = useState<ReminderFrequencyType>('interval');
  const [intervalMinutes, setIntervalMinutes] = useState<number>(30);
  const [targetCount, setTargetCount] = useState<number>(8);
  const [reminderTime, setReminderTime] = useState('8:00 AM');

  useEffect(() => {
    if (routine) {
      setName(routine.name);
      setIcon(routine.icon);
      setRepeatDays(routine.repeatDays || ALL_DAYS);
      setFrequencyType(routine.frequencyType || 'once_daily');
      setIntervalMinutes(routine.intervalMinutes || 30);
      setTargetCount(routine.targetCount || (routine.frequencyType === 'interval' ? 8 : 1));
      setReminderTime(routine.reminderTime || '9:00 PM');
    }
  }, [routine]);

  if (!isOpen || !routine) return null;

  const isMuted = soundService.getMuted();

  const toggleDay = (day: RoutineDay) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSelectAll = () => {
    if (repeatDays.length === ALL_DAYS.length) {
      setRepeatDays([]);
    } else {
      setRepeatDays([...ALL_DAYS]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateRoutine(routine.id, {
      name: name.trim(),
      icon,
      repeatDays: repeatDays.length > 0 ? repeatDays : ALL_DAYS,
      frequencyType,
      intervalMinutes: frequencyType === 'interval' ? intervalMinutes : undefined,
      targetCount: frequencyType === 'interval' ? targetCount : 1,
      reminderTime: frequencyType === 'interval' ? `Every ${intervalMinutes} mins` : reminderTime,
    });

    onUpdated();
    onClose();
  };

  const handleDelete = () => {
    deleteRoutine(routine.id);
    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl bg-surface border border-border p-6 shadow-2xl space-y-5 animate-scaleIn max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-primary-text">Edit Routine</h3>
            <p className="text-xs text-secondary-text font-medium">Customize frequency & reminders</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-secondary-text hover:text-primary-text hover:bg-surface-secondary cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Icon & Name */}
          <div className="p-4 rounded-2xl bg-surface-secondary border border-border space-y-3">
            <label className="text-xs font-bold text-secondary-text block">
              Icon & Name
            </label>

            {/* Icon picker */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={clsx(
                    'w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer',
                    icon === i
                      ? 'bg-peach-soft border-2 border-peach shadow-xs scale-105'
                      : 'bg-surface hover:bg-surface-secondary border border-border'
                  )}
                >
                  {i}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl bg-surface border border-border text-xs font-bold text-primary-text placeholder:text-secondary-text focus:outline-none focus:border-peach"
              required
            />
          </div>

          {/* Reminder Frequency */}
          <div className="p-4 rounded-2xl bg-surface-secondary border border-border space-y-3">
            <label className="text-xs font-bold text-secondary-text block">
              Reminder Frequency
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFrequencyType('interval')}
                className={clsx(
                  'p-2.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center gap-1 cursor-pointer min-h-[48px]',
                  frequencyType === 'interval'
                    ? 'bg-peach text-white border-peach shadow-xs'
                    : 'bg-surface text-secondary-text hover:text-primary-text border-border'
                )}
              >
                <div className="flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Every X mins</span>
                </div>
                <span className="text-[10px] opacity-90 font-semibold">e.g. Every 30 mins</span>
              </button>

              <button
                type="button"
                onClick={() => setFrequencyType('once_daily')}
                className={clsx(
                  'p-2.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center gap-1 cursor-pointer min-h-[48px]',
                  frequencyType === 'once_daily'
                    ? 'bg-peach text-white border-peach shadow-xs'
                    : 'bg-surface text-secondary-text hover:text-primary-text border-border'
                )}
              >
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Once a day</span>
                </div>
                <span className="text-[10px] opacity-90 font-semibold">Specific time only</span>
              </button>
            </div>

            {frequencyType === 'interval' ? (
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold text-secondary-text">Remind every:</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setIntervalMinutes(mins)}
                      className={clsx(
                        'py-2 px-1 rounded-xl text-xs font-black text-center transition-all cursor-pointer min-h-[40px]',
                        intervalMinutes === mins
                          ? 'bg-primary-text text-surface font-black shadow-xs ring-1 ring-primary-text'
                          : 'bg-surface text-secondary-text hover:text-primary-text border border-border'
                      )}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-peach font-bold text-center">
                  💧 Will remind you every {intervalMinutes} minutes
                </div>

                {/* Daily Target Count Stepper */}
                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between text-[11px] font-bold text-secondary-text">
                    <span>Daily Target:</span>
                    <span className="text-primary-text font-black">
                      {targetCount} {name.toLowerCase().includes('water') ? 'glasses' : 'times'}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[6, 8, 10, 12, 16].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setTargetCount(count)}
                        className={clsx(
                          'py-1.5 px-1 rounded-xl text-xs font-black text-center transition-all cursor-pointer min-h-[36px]',
                          targetCount === count
                            ? 'bg-sky-600 text-white font-black shadow-xs ring-1 ring-sky-600'
                            : 'bg-surface text-secondary-text hover:text-primary-text border border-border'
                        )}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] text-secondary-text text-center">
                    🎯 Daily goal: Check off {targetCount} times to complete this habit
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold text-secondary-text">Alert time:</span>
                <input
                  type="text"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  placeholder="9:00 PM"
                  className="w-28 px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-primary-text text-right focus:outline-none focus:border-peach"
                />
              </div>
            )}

            {/* Sound Status Note */}
            <div className="p-2.5 rounded-xl bg-surface/70 border border-border flex items-center gap-2 text-[10px] font-medium text-secondary-text">
              {isMuted ? (
                <>
                  <BellOff className="w-3.5 h-3.5 text-warning flex-shrink-0" />
                  <span>Sound muted: Will alert via notification pop-up alone.</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 text-success flex-shrink-0" />
                  <span>Sound ON: Will play audio chime & show pop-up.</span>
                </>
              )}
            </div>
          </div>

          {/* Repeat On */}
          <div className="p-4 rounded-2xl bg-surface-secondary border border-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-secondary-text">
                Repeat On
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] font-bold text-peach hover:underline cursor-pointer"
              >
                {repeatDays.length === ALL_DAYS.length ? 'Clear all' : 'Every day'}
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center">
              {ALL_DAYS.map((day) => {
                const isSelected = repeatDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={clsx(
                      'w-10 h-10 min-w-[38px] min-h-[38px] rounded-full text-xs font-black transition-all cursor-pointer flex items-center justify-center shadow-2xs',
                      isSelected
                        ? 'bg-peach text-white shadow-xs scale-105 ring-2 ring-peach/40 font-black'
                        : 'bg-surface text-secondary-text hover:text-primary-text border border-border font-bold'
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions: Save & Delete */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 min-h-[48px] py-3 px-4 rounded-2xl bg-success text-white hover:bg-success-hover font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="min-h-[48px] w-12 rounded-2xl bg-danger-soft border border-danger/30 text-danger-text hover:bg-danger hover:text-white transition-all cursor-pointer flex items-center justify-center"
              title="Delete routine"
              aria-label="Delete routine"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoutineModal;
