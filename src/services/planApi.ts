/**
 * Membership Plan API Service
 * Handles membership tier fetching, plan creation, updates, and status toggles.
 */

import { apiClient } from './apiClient';
import { MembershipPlan } from '../types';

export interface CreatePlanPayload {
  name: string;
  duration: string | number;
  durationUnit?: 'Days' | 'Months' | 'Years';
  price: number;
  originalPrice?: number;
  billingCycle?: string;
  badge?: string;
  isPopular?: boolean;
  features?: string[];
  timing?: string;
  description?: string;
  status?: 'Active' | 'Inactive';
}

export type UpdatePlanPayload = Partial<CreatePlanPayload>;

export interface PlanApiResponse {
  success: boolean;
  message: string;
  plan?: MembershipPlan;
}

export const planApi = {
  /**
   * Fetch all membership plans.
   */
  getPlans: async (): Promise<MembershipPlan[]> => {
    return apiClient.get<MembershipPlan[]>('/api/plans');
  },

  /**
   * Create a new membership plan.
   */
  addPlan: async (payload: CreatePlanPayload): Promise<PlanApiResponse> => {
    return apiClient.post<PlanApiResponse>('/api/plans', payload);
  },

  /**
   * Update an existing plan by its ID.
   */
  updatePlan: async (id: string, payload: UpdatePlanPayload): Promise<PlanApiResponse> => {
    return apiClient.put<PlanApiResponse>(`/api/plans/${encodeURIComponent(id)}`, payload);
  },

  /**
   * Toggle the active/inactive status of a plan.
   */
  togglePlanStatus: async (id: string, currentStatus: 'Active' | 'Inactive'): Promise<PlanApiResponse> => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    return apiClient.put<PlanApiResponse>(`/api/plans/${encodeURIComponent(id)}`, {
      status: nextStatus,
    });
  },
};

export default planApi;
