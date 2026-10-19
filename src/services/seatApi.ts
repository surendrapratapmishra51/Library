/**
 * Seat API Service
 * Handles seat layout fetching, seat addition, status updates, and seat removal.
 */

import { apiClient } from './apiClient';
import { Seat, SeatStatus } from '../types';

export interface AddSeatPayload {
  number: string;
  floor: 1 | 2;
  section: 'A' | 'B' | 'C' | 'D';
  status?: SeatStatus;
}

export interface UpdateSeatPayload {
  status?: SeatStatus;
  occupiedBy?: string | null;
  assignedUntil?: string | null;
}

export interface SeatApiResponse {
  success: boolean;
  message: string;
  seat?: Seat;
}

export const seatApi = {
  /**
   * Fetch all library seats with current occupancy status.
   */
  getSeats: async (): Promise<Seat[]> => {
    return apiClient.get<Seat[]>('/api/seats');
  },

  /**
   * Add a new seat to the library floor matrix.
   */
  addSeat: async (payload: AddSeatPayload): Promise<SeatApiResponse> => {
    return apiClient.post<SeatApiResponse>('/api/seats', payload);
  },

  /**
   * Update seat status (available / occupied / maintenance) or occupant.
   * `id` is the seat number (e.g., "A01").
   */
  updateSeat: async (id: string, payload: UpdateSeatPayload): Promise<SeatApiResponse> => {
    return apiClient.put<SeatApiResponse>(`/api/seats/${encodeURIComponent(id)}`, payload);
  },

  /**
   * Delete a seat by seat number.
   */
  deleteSeat: async (seatNumber: string): Promise<SeatApiResponse> => {
    return apiClient.delete<SeatApiResponse>(`/api/seats/${encodeURIComponent(seatNumber)}`);
  },
};

export default seatApi;
