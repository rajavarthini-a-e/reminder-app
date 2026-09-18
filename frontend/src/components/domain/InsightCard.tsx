import React from 'react';
import { Sparkles, Clock, Calendar, CheckCircle2, TrendingUp, Lightbulb } from 'lucide-react';
import { Card, Heading, Text, Badge } from '../ui/index.js';

export interface CoachInsight {
  id: string;
  type: 'timing' | 'consistency' | 'pace' | 'milestone';
  title: string;
  observation: string;
  actionHint?: string;
  tone: 'sage' | 'lavender' | 'peach';
}

interface InsightCardProps {
  insights: CoachInsight[];
  className?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insights, className = '' }) => {
  if (!insights || insights.length === 0) {
    return (
      <Card variant="subtle" className={`text-center py-6 space-y-2 ${className}`}>
        <div className="w-10 h-10 mx-auto rounded-full bg-lavender flex items-center justify-center text-primary">
          <Lightbulb className="w-5 h-5" />
        </div>
        <Heading as="h4" variant="heading" className="text-base font-semibold text-text-primary">
          Gathering Your Study Patterns
        </Heading>
        <Text tone="secondary" variant="body" className="max-w-md mx-auto text-sm">
          As you complete your first focus sessions and pass verification checks, your coach will share
          personalized timing and rhythm insights here.
        </Text>
      </Card>
    );
  }

  const getIcon = (type: CoachInsight['type']) => {
    switch (type) {
      case 'timing':
        return Clock;
      case 'consistency':
        return Calendar;
      case 'pace':
        return TrendingUp;
      case 'milestone':
        return CheckCircle2;
      default:
        return Sparkles;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="today" size="sm">
            💡 Coach's Observations
          </Badge>
          <span className="text-xs text-text-secondary font-medium">Real pattern analysis</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {insights.map((insight) => {
          const Icon = getIcon(insight.type);
          const toneClass =
            insight.tone === 'sage'
              ? 'bg-success-soft text-success border-success/20'
              : insight.tone === 'peach'
              ? 'bg-peach-soft text-peach-text border-peach/20'
              : 'bg-lavender text-primary border-primary/20';

          return (
            <Card
              key={insight.id}
              variant="default"
              className="p-4 sm:p-5 flex flex-col justify-between space-y-3 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${toneClass} flex-shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="text-sm font-semibold text-text-primary leading-snug">
                    {insight.title}
                  </div>
                  <Text tone="secondary" variant="body" className="text-sm leading-relaxed">
                    {insight.observation}
                  </Text>
                </div>
              </div>

              {insight.actionHint && (
                <div className="text-xs text-text-secondary font-medium bg-surface-secondary px-2.5 py-1.5 rounded-lg border border-border/50">
                  <span className="font-semibold text-text-primary">Coach tip:</span> {insight.actionHint}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default InsightCard;
