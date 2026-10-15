import { apiClient } from './client';
export const reportsApi = { generate: () => apiClient.post('/reports/generate') };
