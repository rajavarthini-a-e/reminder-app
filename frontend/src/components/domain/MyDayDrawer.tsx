import React, { useState } from 'react';
import { X, CheckCircle2, Clock, Calendar, AlertCircle, Sparkles, MessageSquare, Send } from 'lucide-react';
import { Card, Heading, Text, Badge, Button, IconButton } from '../ui/index.js';
import { Task } from '@shared/types';

interface MyDayDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  tasks: Task[];
  onStartTask?: (task: Task) => void;
  onVerifyTask?: (task: Task) => void;
}

export const MyDayDrawer: React.FC<MyDayDrawerProps> = ({
  isOpen,
  onClose,
  date,
  tasks,
  onStartTask,
  onVerifyTask,
}) => {
  const [reflectionText, setReflectionText] = useState('');
  const [reflections, setReflections] = useState<string[]>([]);

  if (!isOpen) return null;

  const dateTitle = date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
  const isToday = date.toDateString() === new Date().toDateString();

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionText.trim()) return;
    setReflections([...reflections, reflectionText.trim()]);
    setReflectionText('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-text-primary/30 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="my-day-title"
    >
      <div
        className="w-full md:max-w-xl bg-surface rounded-t-2xl md:rounded-2xl shadow-xl max-h-[90vh] md:max-h-[85vh] flex flex-col overflow-hidden border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface-secondary/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">🌱 Daily Session Proof</span>
              {isToday && (
                <Badge variant="today" size="sm">
                  Today
                </Badge>
              )}
            </div>
            <Heading id="my-day-title" as="h3" variant="title" className="text-lg sm:text-xl font-bold text-text-primary">
              {dateTitle}
            </Heading>
          </div>

          <IconButton
            icon={<X className="w-5 h-5" />}
            aria-label="Close My Day drawer"
            variant="ghost"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Day Progress Summary */}
          <div className="flex items-center justify-between p-3.5 bg-surface-secondary/60 rounded-xl border border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-success-soft text-success flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-text-primary">
                {completedCount} of {tasks.length} Focus Tasks Completed
              </span>
            </div>
            <span className="text-xs font-semibold text-text-secondary tabular-nums">
              {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}% Done
            </span>
          </div>

          {/* Task Timeline for this day */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Scheduled Curriculum
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-8 space-y-2 border border-dashed border-border rounded-xl">
                <Calendar className="w-8 h-8 mx-auto text-text-secondary opacity-60" />
                <div className="text-sm font-semibold text-text-primary">No tasks scheduled for this day</div>
                <div className="text-xs text-text-secondary max-w-xs mx-auto">
                  A rest day or free exploration time. Rest is part of the craft!
                </div>
              </div>
            ) : (
              tasks.map((task) => {
                const scheduledHour = new Date(task.scheduledTime).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      task.completed
                        ? 'bg-success-soft/30 border-success/30'
                        : 'bg-surface border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-text-secondary flex items-center gap-1 tabular-nums">
                            <Clock className="w-3 h-3" /> {scheduledHour} ({task.estimatedMinutes}m)
                          </span>
                          {task.completed ? (
                            <Badge variant="completed" size="sm">
                              Verified
                            </Badge>
                          ) : task.priority === 'CRITICAL' ? (
                            <Badge variant="critical" size="sm">
                              Critical
                            </Badge>
                          ) : (
                            <Badge variant="today" size="sm">
                              Pending
                            </Badge>
                          )}
                        </div>

                        <div className={`text-sm font-semibold ${task.completed ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                          {task.title}
                        </div>

                        {task.topic && (
                          <div className="text-xs text-text-secondary line-clamp-1">
                            Topic: {task.topic}
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      {!task.completed && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {onVerifyTask && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => {
                                onClose();
                                onVerifyTask(task);
                              }}
                              className="text-xs py-1 px-2.5 min-h-[34px]"
                            >
                              Verify
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Mentor Day Reflection & Notes */}
          <div className="space-y-2.5 pt-2 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              <span>Day Reflection & Mentor Notes</span>
            </div>

            {reflections.length > 0 && (
              <div className="space-y-2">
                {reflections.map((ref, idx) => (
                  <div key={idx} className="p-2.5 bg-surface-secondary rounded-lg text-xs text-text-primary border border-border/50">
                    "{ref}"
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSaveReflection} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="How did this session feel? Note your insight..."
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-lg bg-surface border border-border text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button type="submit" variant="secondary" size="sm" className="text-xs min-h-[34px] px-3">
                <Send className="w-3 h-3 mr-1" /> Note
              </Button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-secondary/40 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MyDayDrawer;
