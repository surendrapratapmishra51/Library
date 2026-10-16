import { MembershipPlan } from '../types';

export const mockPlans: MembershipPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    duration: '1 Month',
    durationUnit: 'Months',
    price: 1200,
    originalPrice: 1500,
    billingCycle: 'per month',
    badge: 'Flexible',
    isPopular: false,
    status: 'Active',
    description: 'Ideal for short-term preparation bursts. Full 24/7 or 14-hour access with high-speed fiber internet and power backup.',
    timing: 'Full 24/7 Access or 14-Hour Shift',
    features: [
      'Reserved individual desk & ergonomic chair',
      'High-speed 300 Mbps fiber Wi-Fi',
      'Full AC & 100% power backup',
      'Dual socket & personal warm LED lamp',
      'RO cold & hot drinking water',
      'Biometric entry & CCTV security',
      'Locker available upon request (+₹200/mo)'
    ]
  },
  {
    id: 'quarterly',
    name: 'Quarterly Plan',
    duration: '3 Months',
    durationUnit: 'Months',
    price: 3200,
    originalPrice: 4500,
    billingCycle: 'for 3 months',
    badge: 'Most Popular',
    isPopular: true,
    status: 'Active',
    description: 'Our most popular plan for continuous 90-day syllabus completion. Includes complimentary locker storage and guaranteed fixed desk.',
    timing: 'Full 24/7 Unlimited Access',
    features: [
      'Fixed reserved desk (same seat guaranteed)',
      'Free personal storage shelf / locker',
      'High-speed 300 Mbps fiber Wi-Fi',
      'Dual socket & personal warm LED lamp',
      'Full AC & continuous power backup',
      'RO cold & hot drinking water',
      'Priority seat renewal privileges',
      '1 complimentary mock-test printout voucher'
    ]
  },
  {
    id: 'half-yearly',
    name: '6 Months Plan',
    duration: '6 Months',
    durationUnit: 'Months',
    price: 5900,
    originalPrice: 7500,
    billingCycle: 'for 6 months',
    badge: 'Exam Prep Best Value',
    isPopular: false,
    status: 'Active',
    description: 'Designed for Mains & Interview preparation. Features prime corner/window choice, tea pantry access, and 2-week emergency freeze.',
    timing: 'Full 24/7 Unlimited Access',
    features: [
      'Fixed reserved desk (choice of prime window/corner)',
      'Free dedicated locker included',
      'High-speed 300 Mbps fiber Wi-Fi with priority QOS',
      'Full AC & continuous power backup',
      'RO drinking water with tea/coffee pantry access',
      'Free study break room & discussion zone access',
      '2-week membership freeze option (for emergency)'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    duration: '12 Months',
    durationUnit: 'Months',
    price: 10500,
    originalPrice: 14400,
    billingCycle: 'for 12 months',
    badge: 'Maximum Savings',
    isPopular: false,
    status: 'Active',
    description: 'Long-term foundation course access. Prime executive desk reservation, complimentary large locker, and 1 month membership freeze policy.',
    timing: 'Full 24/7 Unlimited Access',
    features: [
      'Prime premium executive desk reservation',
      'Free large dedicated locker with key lock',
      'High-speed 300 Mbps fiber Wi-Fi',
      'Full AC & continuous power backup',
      'Full pantry & hot water access',
      '1 month membership pause/freeze policy',
      'No registration or security deposit charges',
      'Dedicated power bank & spare charger loan'
    ]
  }
];
