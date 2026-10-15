import { apiClient } from './client';
export const remindersApi = { list: () => apiClient.get('/reminders') };
