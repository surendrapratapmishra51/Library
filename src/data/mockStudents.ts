import { StudentProfile, AttendanceRecord, PaymentRecord } from '../types';

export const mockDefaultStudent: StudentProfile = {
  id: 'std-1042',
  name: 'Vikramaditya Sharma',
  email: 'vikram.sharma@example.com',
  mobile: '+91 98765 43210',
  dob: '2001-08-14',
  address: 'Flat 302, Green Avenue, Model Town',
  planId: 'quarterly',
  planName: 'Quarterly Plan (3 Months)',
  assignedSeat: 'A04',
  membershipStatus: 'Active',
  startDate: '01 Sep 2026',
  expiryDate: '30 Nov 2026',
  lastPayment: {
    amount: 3200,
    date: '01 Sep 2026',
    method: 'UPI / Google Pay',
    invoiceNo: 'INV-2026-0901'
  },
  nextRenewalDate: '30 Nov 2026',
  todayStatus: 'Checked In',
  checkInTime: '08:15 AM'
};

export const mockStudentAttendance: AttendanceRecord[] = [
  {
    id: 'att-1',
    date: '03 Oct 2026 (Today)',
    entryTime: '08:15 AM',
    exitTime: 'Present (In Progress)',
    durationHours: '4 hrs 25 mins',
    status: 'In Progress'
  },
  {
    id: 'att-2',
    date: '02 Oct 2026',
    entryTime: '08:00 AM',
    exitTime: '07:30 PM',
    durationHours: '11 hrs 30 mins',
    status: 'Completed'
  },
  {
    id: 'att-3',
    date: '01 Oct 2026',
    entryTime: '08:10 AM',
    exitTime: '06:45 PM',
    durationHours: '10 hrs 35 mins',
    status: 'Completed'
  },
  {
    id: 'att-4',
    date: '30 Sep 2026',
    entryTime: '08:30 AM',
    exitTime: '08:00 PM',
    durationHours: '11 hrs 30 mins',
    status: 'Completed'
  },
  {
    id: 'att-5',
    date: '29 Sep 2026',
    entryTime: '07:45 AM',
    exitTime: '07:15 PM',
    durationHours: '11 hrs 30 mins',
    status: 'Completed'
  }
];

export const mockStudentPayments: PaymentRecord[] = [
  {
    id: 'pay-001',
    studentName: 'Vikramaditya Sharma',
    studentMobile: '+91 98765 43210',
    planName: 'Quarterly Plan (3 Months)',
    amount: 3200,
    paymentDate: '01 Sep 2026',
    status: 'Completed',
    transactionId: 'TXN-9842104'
  },
  {
    id: 'pay-002',
    studentName: 'Vikramaditya Sharma',
    studentMobile: '+91 98765 43210',
    planName: 'Monthly Plan (Renewal)',
    amount: 1200,
    paymentDate: '01 Aug 2026',
    status: 'Completed',
    transactionId: 'TXN-8741029'
  },
  {
    id: 'pay-003',
    studentName: 'Vikramaditya Sharma',
    studentMobile: '+91 98765 43210',
    planName: 'Monthly Plan (First Join)',
    amount: 1200,
    paymentDate: '01 Jul 2026',
    status: 'Completed',
    transactionId: 'TXN-7639108'
  }
];
