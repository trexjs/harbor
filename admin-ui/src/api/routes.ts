import apiClient from './client';
import { Route, ApiResponse } from '../types';

export const routesApi = {
  getAll: async (): Promise<Route[]> => {
    const response = await apiClient.get<ApiResponse<Route[]>>('/routes');
    return response.data.data;
  },

  getById: async (id: string): Promise<Route> => {
    const response = await apiClient.get<ApiResponse<Route>>(`/routes/${id}`);
    return response.data.data;
  },

  create: async (route: Partial<Route>): Promise<Route> => {
    const response = await apiClient.post<ApiResponse<Route>>('/routes', route);
    return response.data.data;
  },

  update: async (id: string, route: Partial<Route>): Promise<Route> => {
    const response = await apiClient.put<ApiResponse<Route>>(
      `/routes/${id}`,
      route
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/routes/${id}`);
  },
};
