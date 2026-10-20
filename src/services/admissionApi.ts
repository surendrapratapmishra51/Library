/**
 * Admission Request API Service
 * Handles public visitor admission requests and admin approval/rejection workflows.
 */

import { apiClient } from './apiClient';
import { AdmissionRequest, AdmissionStats } from '../types';

export interface SubmitAdmissionPayload {
  name: string;
  mobile: string;
  email: string;
  dob?: string;
  address?: string;
  planId: string;
  planName?: string;
  preferredSeat: string;
  startDate: string;
  shiftTiming?: string;
  notes?: string;
}

export interface AcceptAdmissionPayload {
  seatNumber?: string;
  discount?: number;
  discountReason?: string;
  paidAmount?: number;
  paymentMethod?: string;
  password?: string;
  notes?: string;
}

export interface AdmissionListResponse {
  success: boolean;
  requests: AdmissionRequest[];
  stats: AdmissionStats;
}

export interface AdmissionDetailResponse {
  success: boolean;
  request: AdmissionRequest;
}

export interface AdmissionActionResponse {
  success: boolean;
  message: string;
  request?: AdmissionRequest;
  user?: any;
  seatUnavailable?: boolean;
}

export const admissionApi = {
  /**
   * Submit a new public admission request.
   */
  submitAdmissionRequest: async (
    payload: SubmitAdmissionPayload
  ): Promise<AdmissionActionResponse> => {
    return apiClient.post<AdmissionActionResponse>('/api/admissions', payload);
  },

  /**
   * Fetch all admission requests with optional filtering.
   */
  getAdmissionRequests: async (params?: {
    status?: string;
    planId?: string;
    search?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<AdmissionListResponse> => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    if (params?.planId && params.planId !== 'all') query.append('planId', params.planId);
    if (params?.search) query.append('search', params.search);
    if (params?.from_date) query.append('from_date', params.from_date);
    if (params?.to_date) query.append('to_date', params.to_date);

    const qs = query.toString();
    const endpoint = `/api/admissions${qs ? `?${qs}` : ''}`;
    const data = await apiClient.get<any>(endpoint);
    const reqs = Array.isArray(data.requests) ? data.requests : [];
    const stats: AdmissionStats = data.stats || data.counts || {
      pendingCount: reqs.filter((r: any) => r.status === 'Pending').length,
      acceptedCount: reqs.filter((r: any) => r.status === 'Accepted').length,
      rejectedCount: reqs.filter((r: any) => r.status === 'Rejected').length,
      totalCount: reqs.length,
    };
    return {
      success: Boolean(data.success),
      requests: reqs,
      stats,
    };
  },

  /**
   * Fetch a single admission request by ID.
   */
  getAdmissionRequestById: async (id: string): Promise<AdmissionDetailResponse> => {
    return apiClient.get<AdmissionDetailResponse>(`/api/admissions/${encodeURIComponent(id)}`);
  },

  /**
   * Accept an admission request (creates member, seat allocation, payment record).
   */
  acceptAdmissionRequest: async (
    id: string,
    payload?: AcceptAdmissionPayload
  ): Promise<AdmissionActionResponse> => {
    return apiClient.post<AdmissionActionResponse>(
      `/api/admissions/${encodeURIComponent(id)}/accept`,
      payload || {}
    );
  },

  /**
   * Reject an admission request with optional reason.
   */
  rejectAdmissionRequest: async (
    id: string,
    payload?: { rejectionReason?: string }
  ): Promise<AdmissionActionResponse> => {
    return apiClient.post<AdmissionActionResponse>(
      `/api/admissions/${encodeURIComponent(id)}/reject`,
      payload || {}
    );
  },
};

export default admissionApi;
