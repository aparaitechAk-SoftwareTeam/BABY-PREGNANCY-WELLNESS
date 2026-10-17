import { apiClient } from './client';

export const contentApi = {
  getContentByWeek: (week: number) => apiClient.get(`/pregnancy-content/week/${week}`),
  getTasksByWeek: (week: number) => apiClient.get(`/pregnancy-content/tasks/week/${week}`),
  toggleTask: (taskId: string, isCompleted: boolean) =>
    apiClient.post(`/pregnancy-content/tasks/toggle/${taskId}`, { isCompleted }),
};
