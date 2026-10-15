import { apiClient } from './client';
export const authApi = {
  login: (d: any) => apiClient.post('/auth/login', d),
  signup: (d: any) => apiClient.post('/auth/signup', d),
};
