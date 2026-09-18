import { StoredRoadmap } from '../components/domain/RoadmapCard.js';

const STORAGE_KEY = 'mentor_roadmaps_library_v1';

export const getStoredRoadmaps = (): StoredRoadmap[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse stored roadmaps:', err);
    return [];
  }
};

export const saveStoredRoadmaps = (roadmaps: StoredRoadmap[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roadmaps));
  } catch (err) {
    console.error('Failed to save roadmaps to storage:', err);
  }
};

export const addOrUpdateRoadmap = (roadmap: StoredRoadmap): void => {
  const current = getStoredRoadmaps();
  const existingIdx = current.findIndex(
    (r) =>
      r.id === roadmap.id ||
      r.title.toLowerCase().trim() === roadmap.title.toLowerCase().trim()
  );

  if (existingIdx >= 0) {
    current[existingIdx] = {
      ...current[existingIdx],
      ...roadmap,
      id: current[existingIdx].id, // keep canonical id
    };
  } else {
    // If setting new roadmap to active, pause any existing active roadmap
    if (roadmap.status === 'active') {
      current.forEach((r) => {
        if (r.status === 'active') r.status = 'paused';
      });
    }
    current.unshift(roadmap);
  }

  saveStoredRoadmaps(current);
};

export const togglePauseRoadmap = (id: string): StoredRoadmap[] => {
  const current = getStoredRoadmaps();
  const target = current.find((r) => r.id === id);
  if (target) {
    target.status = target.status === 'active' ? 'paused' : 'active';
    // If it became active, make sure others are paused
    if (target.status === 'active') {
      current.forEach((r) => {
        if (r.id !== id && r.status === 'active') r.status = 'paused';
      });
    }
  }
  saveStoredRoadmaps(current);
  return current;
};

export const archiveRoadmap = (id: string): StoredRoadmap[] => {
  const current = getStoredRoadmaps();
  const target = current.find((r) => r.id === id);
  if (target) {
    target.status = 'archived';
  }
  saveStoredRoadmaps(current);
  return current;
};

export const deleteRoadmap = (id: string): StoredRoadmap[] => {
  const current = getStoredRoadmaps();
  const filtered = current.filter((r) => r.id !== id);
  saveStoredRoadmaps(filtered);
  return filtered;
};

export const setActiveRoadmap = (id: string): StoredRoadmap[] => {
  const current = getStoredRoadmaps();
  const target = current.find((r) => r.id === id);
  if (target) {
    target.status = 'active';
    current.forEach((r) => {
      if (r.id !== id && r.status === 'active') {
        r.status = 'paused';
      }
    });
    saveStoredRoadmaps(current);
  }
  return current;
};

export const resetRoadmap = (id: string): StoredRoadmap[] => {
  const current = getStoredRoadmaps();
  const target = current.find((r) => r.id === id);
  if (target) {
    target.progress = 0;
    target.completedTasks = 0;
    if (target.planData?.milestones) {
      target.planData.milestones.forEach((m: any) => {
        if (Array.isArray(m.tasks)) {
          m.tasks.forEach((t: any) => {
            t.completed = false;
          });
        }
      });
    }
    saveStoredRoadmaps(current);
  }
  return current;
};

export const getOrSynthesizePlanData = (roadmap: StoredRoadmap): any => {
  if (roadmap.planData && Array.isArray(roadmap.planData.milestones) && roadmap.planData.milestones.length > 0) {
    return roadmap.planData;
  }

  // Synthesize realistic milestones based on title and totalTasks
  const total = Math.max(3, roadmap.totalTasks || 9);
  const tasksPerMilestone = Math.max(1, Math.ceil(total / 3));

  return {
    goal: roadmap.title,
    duration: 30,
    rawSummary: roadmap.description || `Comprehensive curriculum for ${roadmap.title}.`,
    milestones: [
      {
        title: 'Foundations & Core Principles',
        tasks: Array.from({ length: tasksPerMilestone }, (_, i) => ({
          title: `${roadmap.title} - Module ${i + 1}: Fundamentals & Environment Setup`,
          topic: `${roadmap.title} Core`,
          estimatedMinutes: 45,
          verificationType: 'LEARNING',
        })),
      },
      {
        title: 'Practical Application & Problem Solving',
        tasks: Array.from({ length: tasksPerMilestone }, (_, i) => ({
          title: `${roadmap.title} - Module ${tasksPerMilestone + i + 1}: Real-world Implementation`,
          topic: `${roadmap.title} Deep Dive`,
          estimatedMinutes: 45,
          verificationType: 'CODE',
        })),
      },
      {
        title: 'Advanced Mastery & Capstone Evaluation',
        tasks: Array.from({ length: Math.max(1, total - tasksPerMilestone * 2) }, (_, i) => ({
          title: `${roadmap.title} - Module ${tasksPerMilestone * 2 + i + 1}: Final Review & Certification`,
          topic: `${roadmap.title} Capstone`,
          estimatedMinutes: 60,
          verificationType: 'TEST',
        })),
      },
    ],
  };
};

export const clearAllRoadmaps = (): void => {
  saveStoredRoadmaps([]);
};

