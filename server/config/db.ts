import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (two levels up from server/config/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'library';
const DB_PORT = Number(process.env.DB_PORT) || 3306;

console.log(`[DB Config] Connecting to MySQL at ${DB_HOST}:${DB_PORT} as user "${DB_USER}" with DB "${DB_NAME}"`);

let pool: mysql.Pool;

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME,
      port: DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }
  return pool;
};

export async function initDatabase() {
  try {
    // 1. Connect to MySQL server to ensure DB exists
    const initConnection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
      port: DB_PORT,
    });

    await initConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await initConnection.end();

    const db = getPool();

    // 2. Create tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS membership_plans (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        duration VARCHAR(50),
        durationUnit VARCHAR(20),
        price DECIMAL(10,2) NOT NULL,
        originalPrice DECIMAL(10,2),
        billingCycle VARCHAR(50),
        badge VARCHAR(50),
        isPopular BOOLEAN DEFAULT FALSE,
        features JSON,
        timing VARCHAR(100),
        description TEXT,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS seats (
        id VARCHAR(50) PRIMARY KEY,
        number VARCHAR(20) UNIQUE NOT NULL,
        floor INT NOT NULL,
        section VARCHAR(10) NOT NULL,
        status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
        hasPowerOutlet BOOLEAN DEFAULT TRUE,
        hasDeskLamp BOOLEAN DEFAULT TRUE,
        isCornerOrWindow BOOLEAN DEFAULT FALSE,
        occupiedBy VARCHAR(100),
        assignedUntil VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        mobile VARCHAR(30),
        email VARCHAR(100),
        address TEXT,
        plan VARCHAR(100),
        planId VARCHAR(50),
        seat VARCHAR(20),
        joiningDate VARCHAR(30),
        expiryDate VARCHAR(30),
        status ENUM('Active', 'Discontinued') DEFAULT 'Active',
        previousSeat VARCHAR(20),
        discontinuedDate VARCHAR(30),
        history JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        timestamp VARCHAR(100),
        details TEXT,
        meta JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS student_profiles (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        mobile VARCHAR(30),
        dob VARCHAR(30),
        address TEXT,
        planId VARCHAR(50),
        planName VARCHAR(100),
        assignedSeat VARCHAR(20),
        membershipStatus VARCHAR(30) DEFAULT 'Active',
        startDate VARCHAR(30),
        expiryDate VARCHAR(30),
        todayStatus VARCHAR(30) DEFAULT 'Not Visited',
        checkInTime VARCHAR(30),
        lastPayment JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 3. Seed data if empty
    await seedDataIfEmpty();

    console.log('[MySQL] Database and tables successfully initialized and verified.');
    return true;
  } catch (error: any) {
    console.error('[MySQL Error] Could not initialize database:', error.message);
    throw error;
  }
}

async function seedDataIfEmpty() {
  const db = getPool();

  // Check plans
  const [plans]: any = await db.query('SELECT COUNT(*) as count FROM membership_plans');
  if (plans[0].count === 0) {
    console.log('[Seed] Seeding default membership plans...');
    const defaultPlans = [
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
        features: JSON.stringify([
          'Reserved individual desk & ergonomic chair',
          'High-speed 300 Mbps fiber Wi-Fi',
          'Full AC & 100% power backup',
          'Dual socket & personal warm LED lamp',
          'RO cold & hot drinking water',
          'Biometric entry & CCTV security',
          'Locker available upon request (+₹200/mo)'
        ])
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
        features: JSON.stringify([
          'Guaranteed Dedicated Fixed Desk',
          'Complimentary Personal Locker storage',
          'High-speed 300 Mbps fiber Wi-Fi',
          'Dual socket & personal warm LED lamp',
          'Full AC & 100% power backup',
          'Priority discussion room access (2 hrs/wk)',
          'RO cold & hot drinking water + pantry access'
        ])
      },
      {
        id: 'half-yearly',
        name: '6 Months Plan',
        duration: '6 Months',
        durationUnit: 'Months',
        price: 5800,
        originalPrice: 9000,
        billingCycle: 'for 6 months',
        badge: 'Value Saver',
        isPopular: false,
        status: 'Active',
        description: 'Designed for serious state/national civil service aspirants. Lowest effective monthly cost with prime desk selection.',
        timing: 'Full 24/7 Unlimited Access',
        features: JSON.stringify([
          'Prime Window / Corner Desk selection',
          'Complimentary Master Locker storage',
          'Dedicated high-priority fiber line',
          'Free printing credits (100 pages/mo)',
          'Discussion room booking (5 hrs/wk)',
          'Free tea/coffee vending 2x daily',
          'Full AC & 100% power backup'
        ])
      },
      {
        id: 'yearly',
        name: 'Yearly Plan',
        duration: '12 Months',
        durationUnit: 'Months',
        price: 10500,
        originalPrice: 18000,
        billingCycle: 'for 12 months',
        badge: 'Best Value',
        isPopular: false,
        status: 'Active',
        description: 'The ultimate commitment to your goal. Permanent fixed desk for an entire year with VIP perks and unlimited amenities.',
        timing: 'Full 24/7 Unlimited Access',
        features: JSON.stringify([
          'Permanent Reserved Desk of your choice',
          'Large personal storage locker',
          'Unlimited high-speed 300 Mbps fiber Wi-Fi',
          'Free printing credits (200 pages/mo)',
          'Unlimited discussion room booking',
          'Complimentary beverage pass',
          'Full AC & 100% power backup'
        ])
      }
    ];

    for (const p of defaultPlans) {
      await db.query(`
        INSERT INTO membership_plans (id, name, duration, durationUnit, price, originalPrice, billingCycle, badge, isPopular, status, description, timing, features)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [p.id, p.name, p.duration, p.durationUnit, p.price, p.originalPrice, p.billingCycle, p.badge, p.isPopular, p.status, p.description, p.timing, p.features]);
    }
  }

  // Check seats
  const [seats]: any = await db.query('SELECT COUNT(*) as count FROM seats');
  if (seats[0].count === 0) {
    console.log('[Seed] Seeding seats (100 total)...');
    const availableSeatNumbers = new Set([
      'A04', 'A09', 'A14', 'A19', 'A23',
      'B02', 'B07', 'B15', 'B21', 'B24',
      'C03', 'C11', 'C18', 'C22',
      'D05', 'D12', 'D17', 'D25'
    ]);
    const maintenanceSeatNumbers = new Set(['A10', 'C15']);
    const mockStudentOccupants = [
      'Aman Verma', 'Pooja Sharma', 'Rohit Kumar', 'Sneha Patel', 'Vikram Singh',
      'Ananya Iyer', 'Rahul Mishra', 'Priya Gupta', 'Karthik Rao', 'Divya Nair',
      'Aditya Joshi', 'Kavita Das', 'Manish Tiwari', 'Megha Sen', 'Saurabh Jha'
    ];

    const sections: { section: 'A' | 'B' | 'C' | 'D'; floor: number }[] = [
      { section: 'A', floor: 1 },
      { section: 'B', floor: 1 },
      { section: 'C', floor: 2 },
      { section: 'D', floor: 2 }
    ];

    let studentIdx = 0;
    for (const sec of sections) {
      for (let i = 1; i <= 25; i++) {
        const numStr = i < 10 ? `0${i}` : `${i}`;
        const seatNumber = `${sec.section}${numStr}`;
        let status = 'occupied';
        let occupant: string | null = null;

        if (availableSeatNumbers.has(seatNumber)) {
          status = 'available';
        } else if (maintenanceSeatNumbers.has(seatNumber)) {
          status = 'maintenance';
        } else {
          occupant = mockStudentOccupants[studentIdx % mockStudentOccupants.length];
          studentIdx++;
        }

        const isCornerOrWindow = (i % 5 === 1 || i % 5 === 0);
        await db.query(`
          INSERT INTO seats (id, number, floor, section, status, hasPowerOutlet, hasDeskLamp, isCornerOrWindow, occupiedBy)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          `seat-${sec.section.toLowerCase()}-${numStr}`,
          seatNumber,
          sec.floor,
          sec.section,
          status,
          true,
          true,
          isCornerOrWindow,
          occupant
        ]);
      }
    }
  }

  // Check users
  const [users]: any = await db.query('SELECT COUNT(*) as count FROM users');
  if (users[0].count === 0) {
    console.log('[Seed] Seeding initial users...');
    const defaultUsers = [
      {
        id: 'usr-101',
        name: 'Vikramaditya Sharma',
        mobile: '+91 98765 43210',
        email: 'vikram.sharma@example.com',
        address: 'Flat 302, Green Avenue, Model Town',
        plan: 'Quarterly Plan',
        planId: 'quarterly',
        seat: 'A04',
        joiningDate: '2026-09-01',
        expiryDate: '2026-11-30',
        status: 'Active',
        history: JSON.stringify(['Joined on 01 Sep 2026 (Assigned Seat A04)'])
      },
      {
        id: 'usr-102',
        name: 'Aakriti Sen',
        mobile: '+91 98123 45678',
        email: 'aakriti.sen@example.com',
        address: 'B-14, Shivalik Enclave, Civil Lines',
        plan: '6 Months Plan',
        planId: 'half-yearly',
        seat: 'B04',
        joiningDate: '2026-07-15',
        expiryDate: '2027-01-15',
        status: 'Active',
        history: JSON.stringify(['Joined on 15 Jul 2026 (Assigned Seat B04)'])
      },
      {
        id: 'usr-103',
        name: 'Rohan Deshmukh',
        mobile: '+91 98234 56789',
        email: 'rohan.deshmukh@example.com',
        address: 'House 88, Sector 12, Urban Estate',
        plan: 'Yearly Plan',
        planId: 'yearly',
        seat: 'A12',
        joiningDate: '2026-01-10',
        expiryDate: '2027-01-09',
        status: 'Active',
        history: JSON.stringify(['Joined on 10 Jan 2026 (Assigned Seat A12)'])
      },
      {
        id: 'usr-104',
        name: 'Pooja Sharma',
        mobile: '+91 98345 67890',
        email: 'pooja.sharma@example.com',
        address: 'Near Old Bus Stand, Teachers Colony',
        plan: 'Monthly Plan',
        planId: 'monthly',
        seat: 'A01',
        joiningDate: '2026-09-24',
        expiryDate: '2026-10-23',
        status: 'Active',
        history: JSON.stringify(['Joined on 24 Sep 2026 (Assigned Seat A01)'])
      }
    ];

    for (const u of defaultUsers) {
      await db.query(`
        INSERT INTO users (id, name, mobile, email, address, plan, planId, seat, joiningDate, expiryDate, status, history)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [u.id, u.name, u.mobile, u.email, u.address, u.plan, u.planId, u.seat, u.joiningDate, u.expiryDate, u.status, u.history]);
    }
  }

  // Check activities
  const [activities]: any = await db.query('SELECT COUNT(*) as count FROM activities');
  if (activities[0].count === 0) {
    const defaultActivities = [
      {
        id: 'act-1',
        type: 'member_added',
        title: 'New Member Registered',
        timestamp: 'Today, 10:30 AM',
        details: 'Vikramaditya Sharma enrolled for Quarterly Plan',
        meta: JSON.stringify({ userName: 'Vikramaditya Sharma', seatNumber: 'A04' })
      },
      {
        id: 'act-2',
        type: 'seat_changed',
        title: 'Seat Allocation Updated',
        timestamp: 'Yesterday, 04:15 PM',
        details: 'Aakriti Sen moved from Seat B01 to Seat B04 (Prime Window)',
        meta: JSON.stringify({ userName: 'Aakriti Sen', oldSeat: 'B01', newSeat: 'B04' })
      }
    ];

    for (const a of defaultActivities) {
      await db.query(`
        INSERT INTO activities (id, type, title, timestamp, details, meta)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [a.id, a.type, a.title, a.timestamp, a.details, a.meta]);
    }
  }
}
