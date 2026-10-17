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
  logSleep: (data: { durationMinutes: number; quality?: string; dateStr?: string }) =>
    apiClient.post('/tracking/sleep', data),

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
};
