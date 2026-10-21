/**
 * User API Service
 * Handles user fetching, registration/creation, updates, seat reallocation, status changes, and deletion.
 */

import { apiClient } from './apiClient';
import { AdminUser } from '../types';

export interface CreateUserPayload {
  name: string;
  mobile: string;
  email?: string;
  password?: string;
  address?: string;
  plan?: string;
  planId?: string;
  seat?: string;
  joiningDate?: string;
  expiryDate?: string;
  status?: 'Active' | 'Discontinued';
  role?: 'student' | 'admin';
  baseFee?: number;
  discount?: number;
  discountReason?: string;
  finalFee?: number;
  paidAmount?: number;
  balanceDue?: number;
  paymentMethod?: string;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  user: AdminUser;
}

export interface UpdateUserPayload {
  name?: string;
  mobile?: string;
  email?: string;
  password?: string;
  address?: string;
  plan?: string;
  planId?: string;
  seat?: string;
  joiningDate?: string;
  expiryDate?: string;
  status?: 'Active' | 'Discontinued';
  previous_seat?: string;
  discontinued_date?: string;
  historyLog?: string;
  baseFee?: number;
  discount?: number;
  discountReason?: string;
  finalFee?: number;
  paidAmount?: number;
  balanceDue?: number;
  additionalPayment?: number;
  paymentMethod?: string;
  paymentNotes?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export const userApi = {
  /**
   * Fetch all registered student members.
   */
  getUsers: async (): Promise<AdminUser[]> => {
    return apiClient.get<AdminUser[]>('/api/users');
  },

  /**
   * Create a new library member.
   */
  createUser: async (payload: CreateUserPayload): Promise<CreateUserResponse> => {
    return apiClient.post<CreateUserResponse>('/api/users', payload);
  },

  /**
   * Update member details, assigned seat, or status by ID.
   */
  updateUser: async (id: string, payload: UpdateUserPayload): Promise<ApiResponse> => {
    return apiClient.put<ApiResponse>(`/api/users/${encodeURIComponent(id)}`, payload);
  },

  /**
   * Delete member by ID (releases their seat on the server).
   */
  deleteUser: async (id: string): Promise<ApiResponse> => {
    return apiClient.delete<ApiResponse>(`/api/users/${encodeURIComponent(id)}`);
  },

  /**
   * Discontinue a member's membership (marks status as Discontinued and releases their seat).
   */
  discontinueUser: async (id: string): Promise<ApiResponse> => {
    return apiClient.put<ApiResponse>(`/api/users/${encodeURIComponent(id)}`, {
      status: 'Discontinued',
    });
  },

  /**
   * Reallocate or change member's assigned seat.
   */
  changeUserSeat: async (id: string, newSeat: string): Promise<ApiResponse> => {
    return apiClient.put<ApiResponse>(`/api/users/${encodeURIComponent(id)}`, {
      seat: newSeat,
    });
  },
};

export default userApi;
