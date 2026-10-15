import { apiClient } from './client';
export const familyApi = { invite: (d: any) => apiClient.post('/family-sharing/invite', d) };
