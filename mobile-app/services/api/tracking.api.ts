import { apiClient } from './client';

export const trackingApi = {
  // Combined dashboard today summary (steps, water, sleep, kicks)
  getTodaySummary: () => apiClient.get('/tracking/today-summary'),

  // Steps
  getTodaySteps: () => apiClient.get('/tracking/steps/today'),
  getStepsHistory: () => apiClient.get('/tracking/steps/history'),
  logSteps: (data: { steps: number; goal?: number; dateStr?: string }) =>
    apiClient.post('/tracking/steps', data),

  // Sleep
  getTodaySleep: () => apiClient.get('/tracking/sleep/today'),
  getSleepHistory: () => apiClient.get('/tracking/sleep/history'),
  logSleep: (data: {
    durationMinutes: number;
    quality?: string;
    dateStr?: string;
    bedTime?: string;
    wakeTime?: string;
    notes?: string;
    awakenings?: number;
  }) => apiClient.post('/tracking/sleep', data),
  deleteSleep: (id: string) => apiClient.delete(`/tracking/sleep/${id}`),

  // Kick movement tracking
  logMovement: (data: any) => apiClient.post('/tracking/kicks', data),
  getMovementHistory: () => apiClient.get('/tracking/kicks'),

  // Hydration tracking
  logWater: (data: any) => apiClient.post('/tracking/water', data),
  getWaterHistory: () => apiClient.get('/tracking/water'),

  // Weight progression tracking
  logWeight: (data: any) => apiClient.post('/tracking/weight', data),
  getWeightHistory: () => apiClient.get('/tracking/weight'),

  // Symptoms tracking
  logSymptoms: (data: any) => apiClient.post('/tracking/symptoms', data),
  getSymptomsHistory: () => apiClient.get('/tracking/symptoms'),

  // Maternal Notes & Doctor Questions
  logNote: (data: { title: string; content: string; category?: string; dateStr?: string; week?: number }) =>
    apiClient.post('/tracking/notes', data),
  getNotes: (category?: string) =>
    apiClient.get('/tracking/notes', { params: category && category !== 'All' ? { category } : undefined }),
  deleteNote: (id: string) => apiClient.delete(`/tracking/notes/${id}`),
};
