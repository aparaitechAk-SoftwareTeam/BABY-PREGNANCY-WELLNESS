import { apiClient } from './client';

export const trackingApi = {
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
