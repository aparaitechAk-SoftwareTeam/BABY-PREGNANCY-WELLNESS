import { apiClient } from './client';

export const pregnancyApi = {
  getWeekData: (week: number) => apiClient.get(`/pregnancy/week/${week}`),
  saveProfile: (data: any) => apiClient.put('/pregnancy/profile', data),
  setupProfile: (data: any) => apiClient.post('/pregnancy/setup', data),
  getProfile: () => apiClient.get('/pregnancy/profile'),
};
