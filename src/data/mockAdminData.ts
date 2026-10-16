export interface AdminMemberRecord {
  id: string;
  name: string;
  mobile: string;
  plan: string;
  seat: string;
  status: 'Active' | 'Pending Renewal' | 'Expired';
  expiry: string;
}

export const mockAdminMembers: AdminMemberRecord[] = [
  { id: 'm1', name: 'Vikramaditya Sharma', mobile: '+91 98765 43210', plan: 'Quarterly', seat: 'A04', status: 'Active', expiry: '30 Nov 2026' },
  { id: 'm2', name: 'Aakriti Sen', mobile: '+91 98123 45678', plan: '6 Months', seat: 'B04', status: 'Active', expiry: '15 Jan 2027' },
  { id: 'm3', name: 'Rohan Deshmukh', mobile: '+91 98234 56789', plan: 'Yearly', seat: 'A12', status: 'Active', expiry: '28 Feb 2027' },
  { id: 'm4', name: 'Sneha Patel', mobile: '+91 98345 67890', plan: 'Monthly', seat: 'C08', status: 'Pending Renewal', expiry: '05 Oct 2026' },
  { id: 'm5', name: 'Aditya Joshi', mobile: '+91 98456 78901', plan: 'Quarterly', seat: 'D14', status: 'Active', expiry: '12 Dec 2026' },
  { id: 'm6', name: 'Pooja Sharma', mobile: '+91 98567 89012', plan: 'Monthly', seat: 'A01', status: 'Active', expiry: '24 Oct 2026' },
  { id: 'm7', name: 'Manish Tiwari', mobile: '+91 98678 90123', plan: '6 Months', seat: 'B18', status: 'Active', expiry: '10 Feb 2027' },
  { id: 'm8', name: 'Ananya Iyer', mobile: '+91 98789 01234', plan: 'Monthly', seat: 'C19', status: 'Pending Renewal', expiry: '06 Oct 2026' }
];

export const mockAdminAttendanceLog = [
  { id: 'att-1', student: 'Vikramaditya Sharma', date: '03 Oct 2026', entryTime: '08:15 AM', exitTime: 'Active (Inside)' },
  { id: 'att-2', student: 'Rohan Deshmukh', date: '03 Oct 2026', entryTime: '07:30 AM', exitTime: 'Active (Inside)' },
  { id: 'att-3', student: 'Aakriti Sen', date: '03 Oct 2026', entryTime: '09:00 AM', exitTime: 'Active (Inside)' },
  { id: 'att-4', student: 'Pooja Sharma', date: '03 Oct 2026', entryTime: '06:45 AM', exitTime: '01:30 PM' },
  { id: 'att-5', student: 'Aditya Joshi', date: '03 Oct 2026', entryTime: '08:00 AM', exitTime: 'Active (Inside)' },
  { id: 'att-6', student: 'Sneha Patel', date: '03 Oct 2026', entryTime: '10:15 AM', exitTime: 'Active (Inside)' },
  { id: 'att-7', student: 'Manish Tiwari', date: '03 Oct 2026', entryTime: '07:00 AM', exitTime: '02:00 PM' }
];

export const mockAdminPaymentsLog = [
  { id: 'p1', student: 'Vikramaditya Sharma', plan: 'Quarterly', amount: 3200, paymentDate: '01 Sep 2026', status: 'Completed' as const },
  { id: 'p2', student: 'Aakriti Sen', plan: '6 Months', amount: 5900, paymentDate: '15 Jul 2026', status: 'Completed' as const },
  { id: 'p3', student: 'Rohan Deshmukh', plan: 'Yearly', amount: 10500, paymentDate: '01 Mar 2026', status: 'Completed' as const },
  { id: 'p4', student: 'Sneha Patel', plan: 'Monthly Renewal', amount: 1200, paymentDate: '05 Sep 2026', status: 'Pending' as const },
  { id: 'p5', student: 'Divya Nair', plan: 'Monthly Renewal', amount: 1200, paymentDate: '02 Oct 2026', status: 'Pending' as const },
  { id: 'p6', student: 'Aditya Joshi', plan: 'Quarterly', amount: 3200, paymentDate: '12 Sep 2026', status: 'Completed' as const }
];
