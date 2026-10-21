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

export interface MonthlyCollectionItem {
  month: string;
  label: string;
  amount: number;
  count: number;
}

export interface PaymentMethodBreakdownItem {
  method: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface PlanWiseCollectionItem {
  planName: string;
  totalPayable: number;
  collected: number;
  due: number;
  memberCount: number;
}

export interface DailyCollectionItem {
  date: string;
  label: string;
  amount: number;
  count: number;
}

export interface FeesSummaryResponse {
  summary: {
    totalFeesDue: number;
    amountCollected: number;
    pendingDuesCount: number;
    pendingDuesAmount: number;
    totalDiscounts: number;
    totalStudents: number;
    statusCounts: {
      paid: number;
      partial: number;
      unpaid: number;
    };
  };
  monthlyCollections: MonthlyCollectionItem[];
  dailyCollections?: DailyCollectionItem[];
  paymentMethodBreakdown: PaymentMethodBreakdownItem[];
  planWiseCollections: PlanWiseCollectionItem[];
  recentTransactions: PaymentItem[];
  filtersApplied?: {
    fromDate: string | null;
    toDate: string | null;
    userId: string;
    planId: string;
  };
}

export interface RecordPaymentPayload {
  userId: string;
  amount: number;
  paymentMethod: string;
  paymentDate?: string;
  transactionId?: string;
  notes?: string;
}

export interface RecordPaymentResponse {
  success: boolean;
  message: string;
  payment: PaymentItem;
  user: {
    id: string;
    name: string;
    paidAmount: number;
    balanceDue: number;
    paymentStatus: 'Paid' | 'Partial' | 'Pending';
  };
}

export interface ManageDiscountPayload {
  discount: number;
  discountReason: string;
}

export interface ManageDiscountResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    baseFee: number;
    discount: number;
    discountReason: string | null;
    finalFee: number;
    paidAmount: number;
    balanceDue: number;
    paymentStatus: 'Paid' | 'Partial' | 'Pending';
  };
}

export interface UserStatementResponse {
  member: {
    id: string;
    name: string;
    mobile: string;
    email: string;
    seat: string;
    plan: string;
    planId: string;
    joiningDate: string;
    expiryDate: string;
    status: 'Active' | 'Discontinued';
    baseFee: number;
    discount: number;
    discountReason: string;
    finalFee: number;
    paidAmount: number;
    balanceDue: number;
    paymentStatus: 'Paid' | 'Partial' | 'Pending';
  };
  transactions: {
    id: string;
    amount: number;
    paymentMethod: string;
    paymentDate: string;
    status: 'Completed' | 'Pending' | 'Failed';
    transactionId: string;
    notes?: string;
    created_at?: string;
  }[];
}

export interface GetPaymentsFilter {
  userId?: string;
  planId?: string;
  fromDate?: string;
  toDate?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  status?: string;
  search?: string;
}

export interface FeesSummaryFilter {
  fromDate?: string;
  toDate?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  planId?: string;
}

export const paymentApi = {
  getPayments: async (params?: GetPaymentsFilter): Promise<PaymentItem[]> => {
    let url = '/api/payments';
    if (params) {
      const query = new URLSearchParams();
      if (params.userId && params.userId !== 'all') query.append('userId', params.userId);
      if (params.planId && params.planId !== 'all') query.append('planId', params.planId);
      const from = params.fromDate || params.startDate;
      const to = params.toDate || params.endDate;
      if (from) query.append('fromDate', from);
      if (to) query.append('toDate', to);
      if (params.paymentMethod && params.paymentMethod !== 'all') query.append('paymentMethod', params.paymentMethod);
      if (params.status && params.status !== 'all') query.append('status', params.status);
      if (params.search) query.append('search', params.search);
      const qStr = query.toString();
      if (qStr) url += `?${qStr}`;
    }
    return apiClient.get<PaymentItem[]>(url);
  },

  getFeesSummary: async (params?: FeesSummaryFilter): Promise<FeesSummaryResponse> => {
    let url = '/api/payments/summary';
    if (params) {
      const query = new URLSearchParams();
      const from = params.fromDate || params.startDate;
      const to = params.toDate || params.endDate;
      if (from) query.append('fromDate', from);
      if (to) query.append('toDate', to);
      if (params.userId && params.userId !== 'all') query.append('userId', params.userId);
      if (params.planId && params.planId !== 'all') query.append('planId', params.planId);
      const qStr = query.toString();
      if (qStr) url += `?${qStr}`;
    }
    return apiClient.get<FeesSummaryResponse>(url);
  },

  getUserPayments: async (userId: string): Promise<PaymentItem[]> => {
    return apiClient.get<PaymentItem[]>(`/api/payments/user/${encodeURIComponent(userId)}`);
  },

  getUserStatement: async (userId: string): Promise<UserStatementResponse> => {
    return apiClient.get<UserStatementResponse>(`/api/payments/statement/${encodeURIComponent(userId)}`);
  },

  recordPayment: async (payload: RecordPaymentPayload): Promise<RecordPaymentResponse> => {
    return apiClient.post<RecordPaymentResponse>('/api/payments', payload);
  },

  manageDiscount: async (userId: string, payload: ManageDiscountPayload): Promise<ManageDiscountResponse> => {
    return apiClient.put<ManageDiscountResponse>(`/api/payments/discount/${encodeURIComponent(userId)}`, payload);
  },
};

export default paymentApi;
