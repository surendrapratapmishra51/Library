export type SeatStatus = 'available' | 'occupied' | 'maintenance';

export interface Seat {
  id: string;
  number: string; // e.g. "A01", "B12"
  floor: 1 | 2;
  section: 'A' | 'B' | 'C' | 'D';
  status: SeatStatus;
  hasPowerOutlet: boolean;
  hasDeskLamp: boolean;
  isCornerOrWindow?: boolean;
  occupiedBy?: string;
  assignedUntil?: string;
}

export interface Facility {
  id: string;
  iconName: string;
  title: string;
  shortDesc: string;
  detailedDesc?: string;
  features?: string[];
}

export interface MembershipPlan {
  id: string;
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
  status: 'Active' | 'Inactive';
}

export interface AdminUser {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  plan: string;
  planId: string;
  seat: string; // e.g. "A04" or "None"
  joiningDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  status: 'Active' | 'Discontinued';
  previousSeat?: string;
  discontinuedDate?: string;
  history?: string[];
}

export interface ActivityItem {
  id: string;
  type: 'member_added' | 'member_discontinued' | 'seat_changed';
  title: string;
  timestamp: string;
  details: string;
  meta?: {
    userName?: string;
    seatNumber?: string;
    oldSeat?: string;
    newSeat?: string;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  examOrGoal: string;
  quote: string;
  seatNumber: string;
  studyDuration: string;
  rating: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  dob: string;
  address: string;
  planId: string;
  planName: string;
  assignedSeat: string;
  membershipStatus: 'Active' | 'Expiring Soon' | 'Expired';
  startDate: string;
  expiryDate: string;
  lastPayment: {
    amount: number;
    date: string;
    method: string;
    invoiceNo: string;
  };
  nextRenewalDate: string;
  todayStatus: 'Checked In' | 'Checked Out' | 'Not Visited';
  checkInTime?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  studentName?: string;
  seatNumber?: string;
  entryTime: string;
  exitTime: string;
  durationHours: string;
  status: 'Completed' | 'In Progress';
}

export interface PaymentRecord {
  id: string;
  studentName: string;
  studentMobile: string;
  planName: string;
  amount: number;
  paymentDate: string;
  status: 'Completed' | 'Pending' | 'Failed';
  transactionId: string;
}

export interface RegistrationFormData {
  fullName: string;
  mobile: string;
  email: string;
  dob: string;
  address: string;
  planId: string;
  preferredSeat: string;
  startDate: string;
  shiftTiming: '24/7 All Day' | 'Morning (6 AM - 2 PM)' | 'Evening (2 PM - 10 PM)' | 'Night (10 PM - 6 AM)';
  notes?: string;
}
