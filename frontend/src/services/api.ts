import {
  DashboardData,
  ExtractedPlan,
  MentorChatMessage,
  Task,
} from '@shared/types';

const API_BASE = '/api';

export async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to load dashboard data');
  return res.json();
}

export async function fetchTodayTasks(): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/tasks/today`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function startTask(taskId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/start`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to start task');
  return res.json();
}

export async function snoozeTask(taskId: string, minutes: number): Promise<any> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/snooze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ minutes }),
  });
  if (!res.ok) throw new Error('Failed to snooze task');
  return res.json();
}

export async function getVerificationPrompt(taskId: string): Promise<{
  taskId: string;
  verificationId: string;
  taskTitle: string;
  verificationType: string;
  question: string;
}> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/verify-prompt`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to generate verification challenge');
  return res.json();
}

export async function submitVerification(
  taskId: string,
  answer: string,
  question: string,
  verificationId?: string
): Promise<{
  success: boolean;
  passed: boolean;
  score: number;
  feedback: string;
  message: string;
}> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer, question, verificationId }),
  });
  const data = await res.json();
  if (!res.ok) {
    return {
      success: false,
      passed: false,
      score: data.score || 30,
      feedback: data.feedback || data.error || 'Verification rejected.',
      message: data.message || 'Please revise your answer.',
    };
  }
  return data;
}

export async function uploadPlanFile(file: File): Promise<ExtractedPlan> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload-plan`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || errorData.error || 'Failed to parse plan file');
  }

  const result = await res.json();
  return result.data;
}

export async function uploadPlanText(planText: string): Promise<ExtractedPlan> {
  const res = await fetch(`${API_BASE}/upload-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planText }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || errorData.error || 'Failed to parse plan text');
  }

  const result = await res.json();
  return result.data;
}

export async function saveGoalPlan(plan: ExtractedPlan): Promise<{ success: boolean; goalId: string }> {
  const res = await fetch(`${API_BASE}/goals/save-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan),
  });

  if (!res.ok) throw new Error('Failed to save plan to database');
  return res.json();
}

export async function fetchChatMessages(): Promise<MentorChatMessage[]> {
  const res = await fetch(`${API_BASE}/mentor/chat`);
  if (!res.ok) throw new Error('Failed to fetch chat history');
  return res.json();
}

export async function sendChatMessage(
  text: string,
  taskId?: string
): Promise<{
  userMessage: MentorChatMessage;
  mentorMessage: MentorChatMessage;
  actionRequired?: string;
  verificationQuestion?: string;
  taskId?: string;
}> {
  const res = await fetch(`${API_BASE}/mentor/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, taskId }),
  });

  if (!res.ok) throw new Error('Failed to send chat message');
  return res.json();
}

export async function acknowledgeReminder(reminderId: string): Promise<void> {
  await fetch(`${API_BASE}/reminders/${reminderId}/acknowledge`, { method: 'POST' });
}

export async function triggerTestAlert(level: number): Promise<any> {
  const res = await fetch(`${API_BASE}/reminders/test-alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level }),
  });
  return res.json();
}

export async function toggleTaskCompletion(taskId: string): Promise<{ success: boolean; completed: boolean; task: Task }> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/toggle`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to toggle task completion');
  return res.json();
}

export async function deleteTask(taskId: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete task');
  return res.json();
}

export async function deleteActivePlan(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/goals/active`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete active plan');
  return res.json();
}
