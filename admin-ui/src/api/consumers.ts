import apiClient from './client';
import { Consumer, ApiResponse } from '../types';

export const consumersApi = {
  getAll: async (): Promise<Consumer[]> => {
    const response = await apiClient.get<ApiResponse<Consumer[]>>('/consumers');
    return response.data.data;
  },

  getById: async (id: string): Promise<Consumer> => {
    const response = await apiClient.get<ApiResponse<Consumer>>(
      `/consumers/${id}`
    );
    return response.data.data;
  },

  create: async (consumer: Partial<Consumer>): Promise<Consumer> => {
    const response = await apiClient.post<ApiResponse<Consumer>>(
      '/consumers',
      consumer
    );
    return response.data.data;
  },

  update: async (
    id: string,
    consumer: Partial<Consumer>
  ): Promise<Consumer> => {
    const response = await apiClient.put<ApiResponse<Consumer>>(
      `/consumers/${id}`,
      consumer
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/consumers/${id}`);
  },
};
