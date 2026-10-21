import { StudentProfile, AttendanceRecord, PaymentRecord } from '../types';

export const mockDefaultStudent: StudentProfile = {
  id: '',
  name: '',
  email: '',
  mobile: '',
  dob: '',
  address: '',
  planId: '',
  planName: 'No Plan Allocated',
  assignedSeat: 'None',
  membershipStatus: 'Inactive',
  startDate: '',
  expiryDate: '',
  nextRenewalDate: '',
  todayStatus: 'Not Checked In'
};

export const mockStudentAttendance: AttendanceRecord[] = [];
export const mockStudentPayments: PaymentRecord[] = [];
