/**
 * Authentication API Service
 * Handles login, session retrieval (getMe), and client-side logout.
 */

import { apiClient } from './apiClient';

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  mobile: string;
  role: 'admin' | 'student';
  seat?: string;
  plan?: string;
  planId?: string;
  joiningDate?: string;
  expiryDate?: string;
  status?: 'Active' | 'Discontinued';
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}

export interface UserProfileResponse {
  id: string;
  name: string;
  email: string | null;
  mobile: string;
  address?: string;
  role: 'admin' | 'student';
  seat?: string;
  plan?: string;
  planId?: string;
  joiningDate?: string;
  expiryDate?: string;
  status: 'Active' | 'Discontinued';
}

export const authApi = {
  /**
   * Authenticate user with mobile or email and password.
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/api/auth/login', credentials);
  },

  /**
   * Get current authenticated user profile using Bearer token.
   */
  getMe: async (): Promise<UserProfileResponse> => {
    return apiClient.get<UserProfileResponse>('/api/auth/me');
  },

  /**
   * Client-side logout: clears token and stored session data.
   */
  logout: (): void => {
    localStorage.removeItem('fz_library_token');
    localStorage.removeItem('fz_library_auth');
    localStorage.removeItem('fz_library_role');
  },
};

export default authApi;
