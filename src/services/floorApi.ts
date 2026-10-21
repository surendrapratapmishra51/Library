/**
 * Floor API Service
 * Handles Floor management, live seat count aggregations, and floor activation/deactivation.
 */

import { apiClient } from './apiClient';
import { Floor, FloorStats } from '../types';

export interface FloorApiResponse {
  success: boolean;
  message: string;
  warning?: string | null;
  floor?: Floor;
}

export interface FloorsListResponse {
  floors: Floor[];
  unassignedStats: FloorStats;
}

export interface CreateFloorPayload {
  name: string;
  description?: string;
  status?: 'Active' | 'Inactive';
  floorNumber?: number | null;
  sortOrder?: number;
}

export interface UpdateFloorPayload {
  name?: string;
  description?: string;
  status?: 'Active' | 'Inactive';
  floorNumber?: number | null;
  sortOrder?: number;
}

export const floorApi = {
  /**
   * Fetch all floors with real-time seat statistics.
   */
  getFloors: async (): Promise<FloorsListResponse> => {
    return apiClient.get<FloorsListResponse>('/api/floors');
  },

  /**
   * Add a new floor with unique name validation.
   */
  createFloor: async (payload: CreateFloorPayload): Promise<FloorApiResponse> => {
    return apiClient.post<FloorApiResponse>('/api/floors', payload);
  },

  /**
   * Update floor details, description, or active/inactive status.
   */
  updateFloor: async (id: string, payload: UpdateFloorPayload): Promise<FloorApiResponse> => {
    return apiClient.put<FloorApiResponse>(`/api/floors/${encodeURIComponent(id)}`, payload);
  },

  /**
   * Delete floor (safely prevented if floor has seats or allocation history).
   */
  deleteFloor: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/floors/${encodeURIComponent(id)}`);
  },
};

export default floorApi;
