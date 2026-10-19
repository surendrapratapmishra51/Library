import sequelize from '../config/database.js';
import User from './User.js';
import Seat from './Seat.js';
import MembershipPlan from './Plan.js';
import Activity from './Activity.js';
import bcrypt from 'bcryptjs';

// Define Associations if needed in future
// User.hasOne(Seat, { foreignKey: 'occupied_by', sourceKey: 'name' });

export const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ [Sequelize] Database connection established successfully.');

    // Relax sql_mode for session to prevent zero-date strict mode errors
    try {
      await sequelize.query("SET SESSION sql_mode = 'NO_ENGINE_SUBSTITUTION'");
    } catch (e) {}

    // Sync all defined models with database tables
    await sequelize.sync();
    console.log('✅ [Sequelize] All database models synchronized successfully.');

    // Safe column check for users table (password & role)
    try {
      const [cols]: any = await sequelize.query('SHOW COLUMNS FROM users');
      const colNames = cols.map((c: any) => c.Field);
      if (!colNames.includes('password')) {
        await sequelize.query("ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT ''");
      }
      if (!colNames.includes('role')) {
        await sequelize.query("ALTER TABLE users ADD COLUMN role ENUM('admin', 'student') DEFAULT 'student'");
      }
    } catch (e) {}

    // Seed Initial Master Admin and Data if table is empty
    await seedInitialData();

    return true;
  } catch (error: any) {
    console.error('❌ [Sequelize Error] Database sync failed:', error.message);
    throw error;
  }
};

const seedInitialData = async () => {
  // 1. Seed Master Admin
  const adminCount = await User.count({ where: { role: 'admin' } });
  if (adminCount === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      id: 'usr-admin-01',
      name: 'FocusZone Administrator',
      email: 'admin@focuszonelibrary.com',
      mobile: '9999999999',
      password: hashedPassword,
      role: 'admin',
      address: 'Library Headquarters, Civil Lines',
      plan: 'Staff Access',
      plan_id: 'staff',
      seat: 'None',
      joining_date: '2026-01-01',
      expiry_date: '2099-12-31',
      status: 'Active',
      history: ['Master Administrator Account Provisioned']
    });
    console.log('🌱 [Seed] Master Admin account created (admin@focuszonelibrary.com / admin123)');
  }

  // Clean up any old dummy users & fake seat occupants from prior runs
  try {
    await User.destroy({ where: { id: 'usr-101' } });
    const realStudentsCount = await User.count({ where: { role: 'student' } });
    if (realStudentsCount === 0) {
      await Seat.update(
        { status: 'available', occupied_by: null, assigned_until: null },
        { where: {} }
      );
      await Activity.destroy({ where: {} });
    }
  } catch (e) {}

  // 3. Seed Membership Plans
  const plansCount = await MembershipPlan.count();
  if (plansCount === 0) {
    await MembershipPlan.bulkCreate([
      {
        id: 'monthly',
        name: 'Monthly Plan',
        duration: '1 Month',
        duration_unit: 'Months',
        price: 1200,
        original_price: 1500,
        billing_cycle: 'per month',
        badge: 'Flexible',
        is_popular: false,
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
        duration_unit: 'Months',
        price: 3200,
        original_price: 4500,
        billing_cycle: 'for 3 months',
        badge: 'Most Popular',
        is_popular: true,
        status: 'Active',
        description: 'Our most popular plan for continuous 90-day syllabus completion. Includes complimentary locker storage and guaranteed fixed desk.',
        timing: 'Full 24/7 Unlimited Access',
        features: [
          'Guaranteed Dedicated Fixed Desk',
          'Complimentary Personal Locker storage',
          'High-speed 300 Mbps fiber Wi-Fi',
          'Dual socket & personal warm LED lamp',
          'Full AC & 100% power backup',
          'Priority discussion room access (2 hrs/wk)',
          'RO cold & hot drinking water + pantry access'
        ]
      },
      {
        id: 'half-yearly',
        name: '6 Months Plan',
        duration: '6 Months',
        duration_unit: 'Months',
        price: 5800,
        original_price: 9000,
        billing_cycle: 'for 6 months',
        badge: 'Value Saver',
        is_popular: false,
        status: 'Active',
        description: 'Designed for serious state/national civil service aspirants. Lowest effective monthly cost with prime desk selection.',
        timing: 'Full 24/7 Unlimited Access',
        features: [
          'Prime Window / Corner Desk selection',
          'Complimentary Master Locker storage',
          'Dedicated high-priority fiber line',
          'Free printing credits (100 pages/mo)',
          'Discussion room booking (5 hrs/wk)',
          'Free tea/coffee vending 2x daily',
          'Full AC & 100% power backup'
        ]
      },
      {
        id: 'yearly',
        name: 'Yearly Plan',
        duration: '12 Months',
        duration_unit: 'Months',
        price: 10500,
        original_price: 18000,
        billing_cycle: 'for 12 months',
        badge: 'Best Value',
        is_popular: false,
        status: 'Active',
        description: 'The ultimate commitment to your goal. Permanent fixed desk for an entire year with VIP perks and unlimited amenities.',
        timing: 'Full 24/7 Unlimited Access',
        features: [
          'Permanent Reserved Desk of your choice',
          'Large personal storage locker',
          'Unlimited high-speed 300 Mbps fiber Wi-Fi',
          'Free printing credits (200 pages/mo)',
          'Unlimited discussion room booking',
          'Complimentary beverage pass',
          'Full AC & 100% power backup'
        ]
      }
    ]);
    console.log('🌱 [Seed] Default membership plans created.');
  }

  // 4. Seed Seats
  const seatsCount = await Seat.count();
  if (seatsCount === 0) {
    const sections = [
      { section: 'A', floor: 1 },
      { section: 'B', floor: 1 },
      { section: 'C', floor: 2 },
      { section: 'D', floor: 2 }
    ];
    const seatRecords = [];
    for (const sec of sections) {
      for (let i = 1; i <= 25; i++) {
        const numStr = i < 10 ? `0${i}` : `${i}`;
        const seatNumber = `${sec.section}${numStr}`;
        const isCornerOrWindow = (i % 5 === 1 || i % 5 === 0);
        seatRecords.push({
          id: `seat-${sec.section.toLowerCase()}-${numStr}`,
          number: seatNumber,
          floor: sec.floor,
          section: sec.section,
          status: 'available',
          has_power_outlet: true,
          has_desk_lamp: true,
          is_corner_or_window: isCornerOrWindow,
          occupied_by: null,
          assigned_until: null
        });
      }
    }

    await Seat.bulkCreate(seatRecords);
    console.log('🌱 [Seed] 100 seats generated and seeded.');
  }
};

export { sequelize, User, Seat, MembershipPlan, Activity };
