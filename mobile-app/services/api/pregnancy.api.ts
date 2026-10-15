import { apiClient } from './client';
export const pregnancyApi = { getWeekData: (week: number) => apiClient.get(`/pregnancy/week/${week}`) };
