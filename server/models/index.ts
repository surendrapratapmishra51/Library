import sequelize from '../config/database.js';
import User from './User.js';
import Seat from './Seat.js';
import MembershipPlan from './Plan.js';
import Activity from './Activity.js';
import Payment from './Payment.js';
import Floor from './Floor.js';
import SeatAllocation from './SeatAllocation.js';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// Define Associations
User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Floor.hasMany(Seat, { foreignKey: 'floor_id', as: 'seats' });
Seat.belongsTo(Floor, { foreignKey: 'floor_id', as: 'floor_info' });

User.hasMany(SeatAllocation, { foreignKey: 'user_id', as: 'allocations' });
SeatAllocation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

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
        await sequelize.query("ALTER TABLE users ADD COLUMN payment_status ENUM('Paid', 'Partial', 'Pending', 'Unpaid') DEFAULT 'Pending'");
      } else {
        try {
          await sequelize.query("ALTER TABLE users MODIFY COLUMN payment_status ENUM('Paid', 'Partial', 'Pending', 'Unpaid') DEFAULT 'Pending'");
        } catch (e) {}
      }
    } catch (e: any) {
      console.warn('[DB Migration Warning] users table check:', e.message);
    }

    // Safe column check & migration for seats table
    try {
      const [seatCols]: any = await sequelize.query('SHOW COLUMNS FROM seats');
      const seatColNames = seatCols.map((c: any) => c.Field);
      
      // Make section nullable to cleanly eliminate the Section concept from new seats
      try {
        await sequelize.query("ALTER TABLE seats MODIFY COLUMN section VARCHAR(20) NULL DEFAULT ''");
      } catch (secErr: any) {
        // Ignored if already nullable
      }

      // Add floor_id and floor_name
      if (!seatColNames.includes('floor_id')) {
        await sequelize.query("ALTER TABLE seats ADD COLUMN floor_id VARCHAR(50) NULL");
      }
      if (!seatColNames.includes('floor_name')) {
        await sequelize.query("ALTER TABLE seats ADD COLUMN floor_name VARCHAR(100) NULL");
      }
      if (!seatColNames.includes('description')) {
        await sequelize.query("ALTER TABLE seats ADD COLUMN description VARCHAR(255) NULL");
      }

      // Allow floor to be nullable (for unassigned / no-floor seats)
      try {
        await sequelize.query("ALTER TABLE seats MODIFY COLUMN floor INT NULL DEFAULT 1");
      } catch (flErr: any) {}

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

    // Safe column check & migration for payments table
    try {
      const [payCols]: any = await sequelize.query('SHOW COLUMNS FROM payments');
      const payColNames = payCols.map((c: any) => c.Field);
      if (!payColNames.includes('transaction_id')) {
        await sequelize.query("ALTER TABLE payments ADD COLUMN transaction_id VARCHAR(100) NULL");
      }
      if (!payColNames.includes('notes')) {
        await sequelize.query("ALTER TABLE payments ADD COLUMN notes TEXT NULL");
      }
      if (!payColNames.includes('created_at')) {
        await sequelize.query("ALTER TABLE payments ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
      }
      if (!payColNames.includes('updated_at')) {
        await sequelize.query("ALTER TABLE payments ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
      }
    } catch (e: any) {
      console.warn('[DB Migration Warning] payments table check:', e.message);
    }

    // Ensure financial consistency for existing student records and payments
    try {
      const [students]: any = await sequelize.query(`
        SELECT u.id, u.name, u.mobile, u.plan, u.plan_id, u.base_fee, u.discount, u.discount_reason, u.final_fee, u.paid_amount, u.balance_due, u.payment_status, u.joining_date, p.price as plan_price, p.name as plan_title
        FROM users u
        LEFT JOIN membership_plans p ON u.plan_id = p.id
        WHERE u.role = 'student'
      `);

      for (const s of students) {
        let bFee = Number(s.base_fee) || 0;
        if (bFee === 0) {
          bFee = Number(s.plan_price) || 1200;
        }
        const disc = Number(s.discount) || 0;
        const fFee = Math.max(0, bFee - disc);

        // Check payments in payments table
        const [userPayments]: any = await sequelize.query(`
          SELECT id, amount, payment_date, status
          FROM payments
          WHERE user_id = ? AND status = 'Completed'
        `, { replacements: [s.id] });

        let actualPaidFromPayments = userPayments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

        // If user has paid_amount in user record greater than existing payment records, create initial/balance payment record
        if (actualPaidFromPayments < Number(s.paid_amount)) {
          const diffAmt = Number(s.paid_amount) - actualPaidFromPayments;
          const payDate = s.joining_date || new Date().toISOString().split('T')[0];
          await sequelize.query(`
            INSERT INTO payments (id, user_id, user_name, user_mobile, plan_name, amount, payment_method, payment_date, status, transaction_id, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'Cash', ?, 'Completed', ?, 'Initial membership enrollment fee payment', NOW(), NOW())
          `, {
            replacements: [
              `pay-init-${s.id}`,
              s.id,
              s.name || 'Member',
              s.mobile || 'N/A',
              s.plan || s.plan_title || 'Membership Plan',
              diffAmt,
              payDate,
              `TXN-INIT-${s.id}`
            ]
          });
          actualPaidFromPayments += diffAmt;
        }

        const effectivePaid = Math.max(Number(s.paid_amount) || 0, actualPaidFromPayments);
        const bDue = Math.max(0, fFee - effectivePaid);

        let pStatus: string;
        if (bDue === 0 && (fFee === 0 || effectivePaid > 0)) {
          pStatus = 'Paid';
        } else if (effectivePaid > 0 && bDue > 0) {
          pStatus = 'Partial';
        } else {
          pStatus = 'Pending';
        }

        await sequelize.query(`
          UPDATE users
          SET base_fee = ?, final_fee = ?, paid_amount = ?, balance_due = ?, payment_status = ?
          WHERE id = ?
        `, { replacements: [bFee, fFee, effectivePaid, bDue, pStatus, s.id] });
      }

      // Dump diagnostic DB state to scratch folder
      try {
        const [allUsers]: any = await sequelize.query(`SELECT id, name, mobile, plan, plan_id, base_fee, discount, final_fee, paid_amount, balance_due, payment_status, joining_date FROM users WHERE role = 'student'`);
        const [allPayments]: any = await sequelize.query(`SELECT id, user_id, user_name, amount, payment_method, payment_date, status FROM payments`);
        const dumpPath = 'C:/Users/suren/.gemini/antigravity-ide/brain/f08ebc88-9bd8-4b27-adbb-0985a79098d3/scratch/db_state.json';
        fs.mkdirSync('C:/Users/suren/.gemini/antigravity-ide/brain/f08ebc88-9bd8-4b27-adbb-0985a79098d3/scratch', { recursive: true });
        fs.writeFileSync(dumpPath, JSON.stringify({ studentCount: allUsers.length, students: allUsers, paymentCount: allPayments.length, payments: allPayments }, null, 2));
      } catch (dumpErr: any) {
        console.warn('[DB State Dump]:', dumpErr.message);
      }
    } catch (e: any) {
      console.warn('[DB Migration Warning] student fee sync:', e.message);
    }

    // Seed Initial Master Admin and Data
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

  // 2. Clean up any dummy users
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

  // 4. Seed Initial Floors
  const floorCount = await Floor.count();
  if (floorCount === 0) {
    await Floor.bulkCreate([
      {
        id: 'floor-ground',
        name: 'Ground Floor',
        floor_number: 1,
        description: 'Main study hall with quiet zone and natural lighting',
        status: 'Active',
        sort_order: 1
      },
      {
        id: 'floor-first',
        name: 'First Floor',
        floor_number: 2,
        description: 'Upper reading floor with silent individual cubicles',
        status: 'Active',
        sort_order: 2
      }
    ]);
    console.log('🌱 [Seed] Initial Floors created: Ground Floor & First Floor');
  }

  // 5. Seed / Update Seats and link with floors
  const seatsCount = await Seat.count();
  if (seatsCount === 0) {
    const seatRecords = [];
    // Floor 1 (Ground Floor) - 50 desks (A01 - A50)
    for (let i = 1; i <= 50; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      const seatNumber = `A${numStr}`;
      const isCornerOrWindow = (i % 5 === 1 || i % 5 === 0);
      seatRecords.push({
        id: `seat-a-${numStr}`,
        number: seatNumber,
        floor: 1,
        floor_id: 'floor-ground',
        floor_name: 'Ground Floor',
        section: '',
        description: isCornerOrWindow ? 'Corner desk with natural window view' : 'Standard silent desk',
        status: 'available' as const,
        has_power_outlet: true,
        has_desk_lamp: true,
        is_corner_or_window: isCornerOrWindow,
        occupied_by: null,
        assigned_until: null
      });
    }

    // Floor 2 (First Floor) - 50 desks (B01 - B50)
    for (let i = 1; i <= 50; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      const seatNumber = `B${numStr}`;
      const isCornerOrWindow = (i % 5 === 1 || i % 5 === 0);
      seatRecords.push({
        id: `seat-b-${numStr}`,
        number: seatNumber,
        floor: 2,
        floor_id: 'floor-first',
        floor_name: 'First Floor',
        section: '',
        description: isCornerOrWindow ? 'Window carrel with dual power outlet' : 'Standard silent cubicle',
        status: 'available' as const,
        has_power_outlet: true,
        has_desk_lamp: true,
        is_corner_or_window: isCornerOrWindow,
        occupied_by: null,
        assigned_until: null
      });
    }

    await Seat.bulkCreate(seatRecords);
    console.log('🌱 [Seed] 100 seats generated across Ground Floor & First Floor (no sections).');
  } else {
    // Ensure all existing seats have floor_id and floor_name populated
    try {
      await Seat.update(
        { floor_id: 'floor-ground', floor_name: 'Ground Floor' },
        { where: { floor: 1, floor_id: null } }
      );
      await Seat.update(
        { floor_id: 'floor-first', floor_name: 'First Floor' },
        { where: { floor: 2, floor_id: null } }
      );
    } catch (e) {}
  }

  // 6. Seed initial allocation history for any currently occupied seat
  try {
    const activeUsersWithSeats = await User.findAll({
      where: {
        role: 'student',
        status: 'Active',
      }
    });

    for (const u of activeUsersWithSeats) {
      if (u.seat && u.seat !== 'None') {
        const existingAlloc = await SeatAllocation.findOne({
          where: { user_id: u.id, seat_number: u.seat, status: 'Active' }
        });
        if (!existingAlloc) {
          const seatRec = await Seat.findOne({ where: { number: u.seat } });
          await SeatAllocation.create({
            id: `alloc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            user_id: u.id,
            user_name: u.name,
            user_identifier: u.mobile || u.email,
            seat_id: seatRec ? seatRec.id : null,
            seat_number: u.seat,
            floor_id: seatRec ? seatRec.floor_id : null,
            floor_name: seatRec ? seatRec.floor_name : 'Ground Floor',
            start_date: u.joining_date || new Date().toISOString().split('T')[0],
            end_date: u.expiry_date,
            status: 'Active',
            action_type: 'Enrolled',
            notes: `Initial allocation for ${u.name}`
          });
        }
      }
    }
  } catch (allocSeedErr: any) {
    console.warn('[Seed Allocation Warning]:', allocSeedErr.message);
  }
};

export { sequelize, User, Seat, MembershipPlan, Activity, Payment, Floor, SeatAllocation };
