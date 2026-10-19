import { apiClient } from './apiClient';

export interface PaymentItem {
  id: string;
  userId: string;
  studentName: string;
  studentMobile: string;
  planName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  status: 'Completed' | 'Pending' | 'Failed';
  transactionId: string;
  notes?: string;
  created_at?: string;
}

export const paymentApi = {
  getPayments: async (): Promise<PaymentItem[]> => {
    return apiClient.get<PaymentItem[]>('/api/payments');
  },

  getUserPayments: async (userId: string): Promise<PaymentItem[]> => {
    return apiClient.get<PaymentItem[]>(`/api/payments/user/${userId}`);
  },
};
