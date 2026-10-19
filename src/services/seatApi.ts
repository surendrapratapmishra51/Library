/**
 * Seat API Service
 * Handles seat layout fetching, single and bulk seat creation, status updates,
 * seat transfers, releases, and allocation history.
 */

import { apiClient } from './apiClient';
import { Seat, SeatStatus, SeatAllocation } from '../types';

export interface AddSeatPayload {
  number: string;
  floorId?: string | null;
  description?: string;
  status?: SeatStatus;
}

export interface BulkAddSeatsPayload {
  count: number;
  prefix?: string;
  startNumber: number;
  floorId?: string | null;
  description?: string;
}

export interface BulkAddSeatsResponse {
  success: boolean;
  message: string;
  requestedCount: number;
  createdCount: number;
  skippedCount: number;
  createdSeats: string[];
  skippedSeats: { number: string; reason: string }[];
}

export interface UpdateSeatPayload {
  status?: SeatStatus;
  floorId?: string | null;
  description?: string;
  occupiedBy?: string | null;
  assignedUntil?: string | null;
}

export interface SeatApiResponse {
  success: boolean;
  message: string;
  warning?: string | null;
  seat?: Seat;
}

export interface SeatStatsResponse {
  totalSeats: number;
  availableSeats: number;
  occupiedSeats: number;
  unavailableSeats: number;
}

export interface TransferSeatPayload {
  userId: string;
  newSeatNumber: string;
}

export interface ReleaseSeatPayload {
  userId?: string;
  seatNumber?: string;
}

export const seatApi = {
  /**
   * Fetch all library seats with current occupancy status, optional floor/status filtering.
   */
  getSeats: async (params?: { floorId?: string; status?: string; search?: string }): Promise<Seat[]> => {
    const query = new URLSearchParams();
    if (params?.floorId) query.set('floorId', params.floorId);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const queryString = query.toString();
    return apiClient.get<Seat[]>(`/api/seats${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Fetch real-time seat statistics calculated from actual database records.
   */
  getStats: async (): Promise<SeatStatsResponse> => {
    return apiClient.get<SeatStatsResponse>('/api/seats/stats');
  },

  /**
   * Add a single seat to the library floor matrix.
   */
  addSeat: async (payload: AddSeatPayload): Promise<SeatApiResponse> => {
    return apiClient.post<SeatApiResponse>('/api/seats', payload);
  },

  /**
   * Bulk-create multiple seats with duplicate skipping and structured report.
   */
  bulkAddSeats: async (payload: BulkAddSeatsPayload): Promise<BulkAddSeatsResponse> => {
    return apiClient.post<BulkAddSeatsResponse>('/api/seats/bulk', payload);
  },

  /**
   * Update seat status, floor, or notes.
   */
  updateSeat: async (id: string, payload: UpdateSeatPayload): Promise<SeatApiResponse> => {
    return apiClient.put<SeatApiResponse>(`/api/seats/${encodeURIComponent(id)}`, payload);
  },

  /**
   * Delete a seat by seat number (safely rejected if occupied).
   */
  deleteSeat: async (seatNumber: string): Promise<SeatApiResponse> => {
    return apiClient.delete<SeatApiResponse>(`/api/seats/${encodeURIComponent(seatNumber)}`);
  },

  /**
   * Transfer an active member to another available seat with history tracking.
   */
  transferSeat: async (payload: TransferSeatPayload): Promise<{ success: boolean; message: string; seat: string }> => {
    return apiClient.post<{ success: boolean; message: string; seat: string }>('/api/seats/transfer', payload);
  },

  /**
   * Explicitly release a member from a seat.
   */
  releaseSeat: async (payload: ReleaseSeatPayload): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }>('/api/seats/release', payload);
  },

  /**
   * Fetch seat allocation and transfer history records.
   */
  getAllocationHistory: async (params?: {
    member?: string;
    seatNumber?: string;
    floorName?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SeatAllocation[]> => {
    const query = new URLSearchParams();
    if (params?.member) query.set('member', params.member);
    if (params?.seatNumber) query.set('seatNumber', params.seatNumber);
    if (params?.floorName) query.set('floorName', params.floorName);
    if (params?.status) query.set('status', params.status);
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    const queryString = query.toString();
    return apiClient.get<SeatAllocation[]>(`/api/seats/allocations/history${queryString ? `?${queryString}` : ''}`);
  },
};

export default seatApi;
