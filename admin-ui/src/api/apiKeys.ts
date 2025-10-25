import apiClient from './client';
import { ApiKey, ApiResponse } from '../types';

export const apiKeysApi = {
  getAll: async (): Promise<ApiKey[]> => {
    const response = await apiClient.get<ApiResponse<ApiKey[]>>('/api-keys');
    return response.data.data;
  },

  create: async (key: Partial<ApiKey>): Promise<ApiKey> => {
    const response = await apiClient.post<ApiResponse<ApiKey>>(
      '/api-keys',
      key
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api-keys/${id}`);
  },

  revoke: async (id: string): Promise<void> => {
    await apiClient.put(`/api-keys/${id}/revoke`);
  },
};
