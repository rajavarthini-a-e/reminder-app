import React from 'react';
import { Sparkles, Flame, CheckCircle2, Clock, BookOpen, Award } from 'lucide-react';
import { Card, Heading, Text, Badge } from '../ui/index.js';
import { Illustration, IllustrationName } from '../ui/Illustration.js';
import { Mascot } from '../ui/Mascot.js';
import clsx from 'clsx';

interface GardenMetric {
  label: string;
  value: number | string;
  icon: React.ElementType;
  tone: 'sage' | 'lavender' | 'peach';
}

interface GardenViewProps {
  progressPercentage: number; // 0 - 100
  totalCompletedTasks: number;
  totalTasks: number;
  streak: number;
  deepWorkMinutes?: number;
  milestonesUnlocked?: number;
  topicsLearned?: number;
  className?: string;
  showMetricsGrid?: boolean;
}

export const GardenView: React.FC<GardenViewProps> = ({
  progressPercentage,
  totalCompletedTasks,
  totalTasks,
  streak,
  deepWorkMinutes = 0,
  milestonesUnlocked = 0,
  topicsLearned = 0,
  className = '',
  showMetricsGrid = true,
}) => {
  // Determine growth stage from real progress
  let stageName = 'Seed in Warm Soil';
  let illustrationName: IllustrationName = 'seed';
  let growthMessage = "Every tree begins as a seed. Ready for today's little win?";

  if (progressPercentage >= 100 && totalTasks > 0) {
    stageName = 'Full Radiant Canopy';
    illustrationName = 'blooming';
    growthMessage = 'Mastery achieved! Your growth tree stands in full bloom.';
  } else if (progressPercentage >= 75) {
    stageName = 'Lush Flourishing Garden';
    illustrationName = 'blooming';
    growthMessage = 'Flourishing beautifully! You are in the final stretch.';
  } else if (progressPercentage >= 50) {
    stageName = 'Budding Blooms';
    illustrationName = 'blooming';
    growthMessage = 'Halfway mark! Your consistent study habits are blossoming.';
  } else if (progressPercentage >= 20 || totalCompletedTasks >= 3) {
    stageName = 'Growing Foliage';
    illustrationName = 'plant';
    growthMessage = 'Steady branches! Small daily wins are compounding into real skill.';
  } else if (progressPercentage > 0 || totalCompletedTasks > 0) {
    stageName = 'Tender Green Sprout';
    illustrationName = 'sprout';
    growthMessage = 'First leaves unfurled! Your learning momentum is taking root.';
  }

  const hoursLearned = (deepWorkMinutes / 60).toFixed(1);
  const remainingGoals = Math.max(0, totalTasks - totalCompletedTasks);

  const metrics: GardenMetric[] = [
    {
      label: 'Focus Sessions',
      value: totalCompletedTasks,
      icon: CheckCircle2,
      tone: 'sage',
    },
    {
      label: 'Consistency Streak',
      value: `${streak}d`,
      icon: Flame,
      tone: 'peach',
    },
    {
      label: 'Deep Work Hours',
      value: `${hoursLearned}h`,
      icon: Clock,
      tone: 'sage',
    },
    {
      label: 'Topics Mastered',
      value: topicsLearned,
      icon: BookOpen,
      tone: 'lavender',
    },
    {
      label: 'Milestones Earned',
      value: milestonesUnlocked,
      icon: Award,
      tone: 'peach',
    },
    {
      label: 'Growth Stage',
      value: stageName.split(' ')[0],
      icon: Sparkles,
      tone: 'lavender',
    },
  ];

  return (
    <div
      className={`space-y-6 ${className}`}
      role="region"
      aria-label={`My Growth Journey Garden. Progress: ${Math.round(progressPercentage)} percent, Stage: ${stageName}`}
    >
      {/* Living Garden Sanctuary Card - Purple/Plum Card with Full Dynamic Height & Word Wrapping */}
      <div className="relative w-full h-auto min-h-fit rounded-3xl p-5 sm:p-7 bg-primary text-white shadow-card border border-primary-hover/30">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          {/* Garden Living Asset + Cat Mascot companion */}
          <div className="relative flex-shrink-0 flex items-center justify-center p-3 bg-white/15 backdrop-blur-md rounded-3xl border border-white/25 shadow-lg">
            <Illustration name={illustrationName} className="w-28 h-28 sm:w-32 sm:h-32 transition-transform duration-500 hover:scale-105" />
            <div className="absolute -bottom-2.5 bg-white px-3 py-0.5 rounded-full border border-border text-xs font-black text-primary shadow-sm">
              {Math.round(progressPercentage)}% Bloom
            </div>
            {/* Friendly Cat Mascot tending garden */}
            <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-surface shadow-md flex items-center justify-center p-1">
              <Mascot
                pose={progressPercentage >= 75 ? 'celebrating' : 'encouraging'}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Emotional Framing & Message */}
          <div className="flex-1 space-y-3 min-w-0 w-full">
            <div className="inline-flex items-center gap-2 flex-wrap justify-center md:justify-start">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm border border-white/25">
                🌱 My Growth Journey
              </span>
              <span className="text-xs text-white/90 font-semibold tracking-wide">
                Stage: {stageName}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white leading-snug break-words whitespace-normal">
              {growthMessage}
            </h3>

            <p className="text-white/90 text-sm sm:text-base w-full leading-relaxed break-words whitespace-normal">
              Each verified task feeds your garden. Progress isn't a race or a percentage test — it's
              tending your daily focus one leaf at a time.
            </p>

            {/* Chunky Big-Number Progress Banner (Principle C) */}
            <div className="pt-3 space-y-2">
              <div className="flex justify-between items-baseline text-xs sm:text-sm font-bold text-white">
                <span className="text-sm sm:text-base font-black tracking-tight">
                  {totalCompletedTasks} / {totalTasks} Goals Completed
                </span>
                <span className="text-white/90 font-medium">
                  {remainingGoals > 0 ? `${remainingGoals} goals left for milestone` : 'Milestone achieved!'}
                </span>
              </div>
              <div className="w-full h-3.5 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden p-0.5 border border-white/30">
                <div
                  className="h-full bg-peach rounded-full transition-all duration-700 ease-out shadow-sm"
                  style={{ width: `${Math.min(100, Math.max(progressPercentage > 0 ? 5 : 0, progressPercentage))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Human-Labeled Metrics Grid with Distinct Card Identities (Principle D) */}
      {showMetricsGrid && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            const toneBorderClass =
              m.tone === 'sage'
                ? 'border-l-4 border-l-success'
                : m.tone === 'peach'
                ? 'border-l-4 border-l-peach'
                : 'border-l-4 border-l-lavender-dark';

            const toneBadgeClass =
              m.tone === 'sage'
                ? 'bg-success-soft text-success border-success/20'
                : m.tone === 'peach'
                ? 'bg-peach-soft text-peach-text border-peach/20'
                : 'bg-lavender text-primary border-primary/20';

            return (
              <Card
                key={idx}
                variant="default"
                className={clsx(
                  'p-4 sm:p-5 flex items-center gap-3.5 hover:shadow-card transition-all rounded-2xl',
                  toneBorderClass
                )}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${toneBadgeClass} flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xl sm:text-2xl font-black text-text-primary tabular-nums tracking-tight truncate">
                    {m.value}
                  </div>
                  <div className="text-xs font-semibold text-text-secondary truncate">
                    {m.label}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GardenView;
