import { apiClient } from './client';
export const trackingApi = { logMovement: (d: any) => apiClient.post('/tracking/movement', d) };
