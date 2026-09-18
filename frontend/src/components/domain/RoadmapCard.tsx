import React from 'react';
import { BookOpen, Calendar, CheckCircle2, Pause, Play, Archive, MoreVertical, Sparkles, RotateCcw, Trash2 } from 'lucide-react';
import { Card, Heading, Text, Badge, Button } from '../ui/index.js';

export type RoadmapStatus = 'active' | 'paused' | 'completed' | 'archived';

export interface StoredRoadmap {
  id: string;
  title: string;
  description?: string;
  status: RoadmapStatus;
  progress: number; // 0 - 100
  totalTasks: number;
  completedTasks: number;
  startDate: string;
  deadline: string;
  subjectTag?: string;
  planData?: any; // ExtractedPlan if available
}

interface RoadmapCardProps {
  roadmap: StoredRoadmap;
  onSelectActive?: (id: string) => void;
  onTogglePause?: (id: string) => void;
  onArchive?: (id: string) => void;
  onResume?: (id: string) => void;
  onReset?: (id: string, title: string) => void;
  onDelete?: (id: string, title: string) => void;
  className?: string;
}

export const RoadmapCard: React.FC<RoadmapCardProps> = ({
  roadmap,
  onSelectActive,
  onTogglePause,
  onArchive,
  onResume,
  onReset,
  onDelete,
  className = '',
}) => {
  const getStatusBadge = (status: RoadmapStatus) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="today" size="sm">
            🌿 Active Journey
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="pending" size="sm">
            ⏸️ Paused
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="completed" size="sm">
            🎉 Completed
          </Badge>
        );
      case 'archived':
        return (
          <Badge variant="neutral" size="sm">
            📦 Archived
          </Badge>
        );
    }
  };

  const isActive = roadmap.status === 'active';

  return (
    <Card
      variant={isActive ? 'hero' : 'default'}
      className={`relative flex flex-col justify-between space-y-4 transition-all hover:shadow-card p-4 sm:p-5 ${className}`}
    >
      {/* Top Header: Title, Status Badge, Subject */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge(roadmap.status)}
            {roadmap.subjectTag && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-surface-secondary text-text-secondary border border-border/50">
                {roadmap.subjectTag}
              </span>
            )}
          </div>

          <div className="text-xs text-text-secondary font-medium tabular-nums flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Due {new Date(roadmap.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        <div>
          <Heading as="h4" variant="heading" className="text-base sm:text-lg font-bold text-text-primary break-words leading-snug">
            {roadmap.title}
          </Heading>
          {roadmap.description && (
            <Text tone="secondary" variant="body" className="break-words leading-relaxed mt-1 text-sm">
              {roadmap.description}
            </Text>
          )}
        </div>
      </div>

      {/* Middle: Progress Bar & Task Count */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-xs text-text-secondary font-medium">
          <span>{roadmap.completedTasks} of {roadmap.totalTasks} Tasks Completed</span>
          <span className="tabular-nums font-semibold text-text-primary">{Math.round(roadmap.progress)}%</span>
        </div>
        <div className="w-full h-2 bg-surface-secondary rounded-full overflow-hidden p-0.5 border border-border/40">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isActive ? 'bg-success' : 'bg-primary'
            }`}
            style={{ width: `${Math.min(100, Math.max(roadmap.progress > 0 ? 4 : 0, roadmap.progress))}%` }}
          />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {isActive ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onTogglePause?.(roadmap.id)}
              className="text-xs py-1.5 px-3 min-h-[36px]"
            >
              <Pause className="w-3.5 h-3.5 mr-1.5" /> Pause
            </Button>
          ) : (
            <Button
              variant="success"
              size="sm"
              onClick={() => {
                if (onSelectActive) onSelectActive(roadmap.id);
                else if (onResume) onResume(roadmap.id);
              }}
              className="text-xs py-1.5 px-3 min-h-[36px]"
            >
              <Play className="w-3.5 h-3.5 mr-1.5" /> Set Active
            </Button>
          )}

          {/* Reset Roadmap (Start from 0% / Day 1) */}
          {onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReset(roadmap.id, roadmap.title)}
              className="text-xs py-1.5 px-2.5 min-h-[36px] text-text-secondary hover:text-text-primary"
              title="Reset roadmap to start fresh from Day 1"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
            </Button>
          )}

          {roadmap.status !== 'archived' && onArchive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onArchive(roadmap.id)}
              className="text-xs py-1.5 px-2.5 min-h-[36px] text-text-secondary hover:text-text-primary"
            >
              <Archive className="w-3.5 h-3.5 mr-1" /> Archive
            </Button>
          )}

          {/* Delete Roadmap */}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(roadmap.id, roadmap.title)}
              className="text-xs py-1.5 px-2.5 min-h-[36px] text-text-secondary hover:text-danger hover:bg-danger-soft/40"
              title={`Delete ${roadmap.title}`}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1 text-danger" /> Delete
            </Button>
          )}
        </div>

        {isActive && (
          <span className="text-xs font-semibold text-success flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> In Progress
          </span>
        )}
      </div>
    </Card>
  );
};

export default RoadmapCard;
