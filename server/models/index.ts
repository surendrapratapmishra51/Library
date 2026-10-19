import sequelize from '../config/database.js';
import User from './User.js';
import Seat from './Seat.js';
import MembershipPlan from './Plan.js';
import Activity from './Activity.js';
import Payment from './Payment.js';
import bcrypt from 'bcryptjs';

// Define Associations
User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

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

    // Safe column check & migration for users table
    try {
      const [cols]: any = await sequelize.query('SHOW COLUMNS FROM users');
      const colNames = cols.map((c: any) => c.Field);
      if (!colNames.includes('password')) {
        await sequelize.query("ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT ''");
      }
      if (!colNames.includes('role')) {
        await sequelize.query("ALTER TABLE users ADD COLUMN role ENUM('admin', 'student') DEFAULT 'student'");
      }
      if (!colNames.includes('joining_date')) {
        if (colNames.includes('joiningDate')) {
          await sequelize.query("ALTER TABLE users CHANGE COLUMN joiningDate joining_date VARCHAR(30) NULL");
        } else {
          await sequelize.query("ALTER TABLE users ADD COLUMN joining_date VARCHAR(30) NULL");
        }
      }
      if (!colNames.includes('expiry_date')) {
        if (colNames.includes('expiryDate')) {
          await sequelize.query("ALTER TABLE users CHANGE COLUMN expiryDate expiry_date VARCHAR(30) NULL");
        } else {
          await sequelize.query("ALTER TABLE users ADD COLUMN expiry_date VARCHAR(30) NULL");
        }
      }
      if (!colNames.includes('plan_id')) {
        if (colNames.includes('planId')) {
          await sequelize.query("ALTER TABLE users CHANGE COLUMN planId plan_id VARCHAR(50) DEFAULT 'monthly'");
        } else {
          await sequelize.query("ALTER TABLE users ADD COLUMN plan_id VARCHAR(50) DEFAULT 'monthly'");
        }
      }
      if (!colNames.includes('previous_seat')) {
        if (colNames.includes('previousSeat')) {
          await sequelize.query("ALTER TABLE users CHANGE COLUMN previousSeat previous_seat VARCHAR(20) NULL");
        } else {
          await sequelize.query("ALTER TABLE users ADD COLUMN previous_seat VARCHAR(20) NULL");
        }
      }
      if (!colNames.includes('discontinued_date')) {
        if (colNames.includes('discontinuedDate')) {
          await sequelize.query("ALTER TABLE users CHANGE COLUMN discontinuedDate discontinued_date VARCHAR(30) NULL");
        } else {
          await sequelize.query("ALTER TABLE users ADD COLUMN discontinued_date VARCHAR(30) NULL");
        }
      }
      if (!colNames.includes('created_at')) {
        await sequelize.query("ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
      }
      if (!colNames.includes('updated_at')) {
        await sequelize.query("ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
      }
      if (!colNames.includes('base_fee')) {
        await sequelize.query("ALTER TABLE users ADD COLUMN base_fee DECIMAL(10,2) DEFAULT 0");
      }
      if (!colNames.includes('discount')) {
        await sequelize.query("ALTER TABLE users ADD COLUMN discount DECIMAL(10,2) DEFAULT 0");
      }
      if (!colNames.includes('discount_reason')) {
        await sequelize.query("ALTER TABLE users ADD COLUMN discount_reason VARCHAR(255) NULL");
      }
      if (!colNames.includes('final_fee')) {
        await sequelize.query("ALTER TABLE users ADD COLUMN final_fee DECIMAL(10,2) DEFAULT 0");
      }
      if (!colNames.includes('paid_amount')) {
        await sequelize.query("ALTER TABLE users ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT 0");
      }
      if (!colNames.includes('balance_due')) {
        await sequelize.query("ALTER TABLE users ADD COLUMN balance_due DECIMAL(10,2) DEFAULT 0");
      }
      if (!colNames.includes('payment_status')) {
        await sequelize.query("ALTER TABLE users ADD COLUMN payment_status ENUM('Paid', 'Partial', 'Pending') DEFAULT 'Pending'");
      }
    } catch (e: any) {
      console.warn('[DB Migration Warning] users table check:', e.message);
    }

    // Safe column check & migration for seats table
    try {
      const [seatCols]: any = await sequelize.query('SHOW COLUMNS FROM seats');
      const seatColNames = seatCols.map((c: any) => c.Field);
      if (!seatColNames.includes('has_power_outlet') && seatColNames.includes('hasPowerOutlet')) {
        await sequelize.query("ALTER TABLE seats CHANGE COLUMN hasPowerOutlet has_power_outlet BOOLEAN DEFAULT TRUE");
      }
      if (!seatColNames.includes('has_desk_lamp') && seatColNames.includes('hasDeskLamp')) {
        await sequelize.query("ALTER TABLE seats CHANGE COLUMN hasDeskLamp has_desk_lamp BOOLEAN DEFAULT TRUE");
      }
      if (!seatColNames.includes('is_corner_or_window') && seatColNames.includes('isCornerOrWindow')) {
        await sequelize.query("ALTER TABLE seats CHANGE COLUMN isCornerOrWindow is_corner_or_window BOOLEAN DEFAULT FALSE");
      }
      if (!seatColNames.includes('occupied_by') && seatColNames.includes('occupiedBy')) {
        await sequelize.query("ALTER TABLE seats CHANGE COLUMN occupiedBy occupied_by VARCHAR(100) NULL");
      }
      if (!seatColNames.includes('assigned_until') && seatColNames.includes('assignedUntil')) {
        await sequelize.query("ALTER TABLE seats CHANGE COLUMN assignedUntil assigned_until VARCHAR(50) NULL");
      }
      if (!seatColNames.includes('created_at')) {
        await sequelize.query("ALTER TABLE seats ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
      }
      if (!seatColNames.includes('updated_at')) {
        await sequelize.query("ALTER TABLE seats ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
      }
    } catch (e: any) {
      console.warn('[DB Migration Warning] seats table check:', e.message);
    }

    // Safe column check & migration for membership_plans table
    try {
      const [planCols]: any = await sequelize.query('SHOW COLUMNS FROM membership_plans');
      const planColNames = planCols.map((c: any) => c.Field);
      if (!planColNames.includes('duration_unit') && planColNames.includes('durationUnit')) {
        await sequelize.query("ALTER TABLE membership_plans CHANGE COLUMN durationUnit duration_unit VARCHAR(20) DEFAULT 'Months'");
      }
      if (!planColNames.includes('original_price') && planColNames.includes('originalPrice')) {
        await sequelize.query("ALTER TABLE membership_plans CHANGE COLUMN originalPrice original_price DECIMAL(10,2) NULL");
      }
      if (!planColNames.includes('billing_cycle') && planColNames.includes('billingCycle')) {
        await sequelize.query("ALTER TABLE membership_plans CHANGE COLUMN billingCycle billing_cycle VARCHAR(50) NULL");
      }
      if (!planColNames.includes('is_popular') && planColNames.includes('isPopular')) {
        await sequelize.query("ALTER TABLE membership_plans CHANGE COLUMN isPopular is_popular BOOLEAN DEFAULT FALSE");
      }
      if (!planColNames.includes('created_at')) {
        await sequelize.query("ALTER TABLE membership_plans ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
      }
      if (!planColNames.includes('updated_at')) {
        await sequelize.query("ALTER TABLE membership_plans ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
      }
    } catch (e: any) {
      console.warn('[DB Migration Warning] membership_plans table check:', e.message);
    }

    // Safe column check & migration for activities table
    try {
      const [actCols]: any = await sequelize.query('SHOW COLUMNS FROM activities');
      const actColNames = actCols.map((c: any) => c.Field);
      if (!actColNames.includes('created_at')) {
        await sequelize.query("ALTER TABLE activities ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
      }
      if (!actColNames.includes('updated_at')) {
        await sequelize.query("ALTER TABLE activities ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
      }
    } catch (e: any) {
      console.warn('[DB Migration Warning] activities table check:', e.message);
    }

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

export { sequelize, User, Seat, MembershipPlan, Activity, Payment };
