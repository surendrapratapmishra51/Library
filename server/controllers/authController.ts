import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { User, Seat, SeatAllocation, MembershipPlan, Activity } from '../models/index.js';
import { generateToken } from '../utils/jwt.js';
import { AuthRequest } from '../middleware/auth.js';
import { getTodayDateString, calculateExpiryDate } from '../utils/dateUtils.js';

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please enter registered mobile/email and password.' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Query user by email or mobile using Sequelize Op.or
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: cleanIdentifier },
          { mobile: identifier.trim() }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Account not found with this email or mobile number.' });
    }

    if (user.status === 'Discontinued') {
      return res.status(403).json({ error: 'This account has been discontinued. Please contact library administration.' });
    }

    if (!user.password) {
      return res.status(500).json({ error: 'Password not configured for this account. Contact administrator.' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect password. Please verify and try again.' });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email || '',
      mobile: user.mobile,
      role: user.role
    });

    res.json({
      success: true,
      message: 'Sign in successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        role: user.role,
        seat: user.seat,
        plan: user.plan,
        planId: user.plan_id,
        joiningDate: user.joining_date,
        expiryDate: user.expiry_date,
        status: user.status,
        baseFee: Number(user.base_fee) || 0,
        discount: Number(user.discount) || 0,
        discountReason: user.discount_reason || '',
        finalFee: Number(user.final_fee) || 0,
        paidAmount: Number(user.paid_amount) || 0,
        balanceDue: Number(user.balance_due) || 0,
        paymentStatus: user.payment_status || 'Pending'
      }
    });
  } catch (error: any) {
    console.error('[Auth Error] Login failed:', error.message);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      address: user.address,
      role: user.role,
      seat: user.seat,
      plan: user.plan,
      planId: user.plan_id,
      joiningDate: user.joining_date,
      expiryDate: user.expiry_date,
      status: user.status,
      baseFee: Number(user.base_fee) || 0,
      discount: Number(user.discount) || 0,
      discountReason: user.discount_reason || '',
      finalFee: Number(user.final_fee) || 0,
      paidAmount: Number(user.paid_amount) || 0,
      balanceDue: Number(user.balance_due) || 0,
      paymentStatus: user.payment_status || 'Pending'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/auth/register (or /signup)
 * Register new student or admin account with database persistence and JWT creation.
 */
export const register = async (req: Request, res: Response) => {
  try {
    const {
      name,
      mobile,
      email,
      password,
      role = 'student',
      adminPasscode,
      planId,
      preferredSeat,
      address,
      dob
    } = req.body;

    // 1. Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full Name is required.' });
    }
    if (!mobile || !String(mobile).trim() || String(mobile).trim().length < 10) {
      return res.status(400).json({ error: 'Valid 10-digit mobile number is required.' });
    }
    if (!password || String(password).trim().length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanName = name.trim();
    const cleanMobile = String(mobile).trim();
    const cleanEmail = email && typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
    const cleanRole: 'admin' | 'student' = role === 'admin' ? 'admin' : 'student';

    // 2. Reject any attempt to register an admin account via public registration
    if (cleanRole === 'admin') {
      return res.status(403).json({
        error: 'Administrator accounts cannot be created via public registration. Contact the library administration.'
      });
    }


    // 3. Check duplicate mobile or email
    const duplicateConditions: any[] = [{ mobile: cleanMobile }];
    if (cleanEmail) {
      duplicateConditions.push({ email: cleanEmail });
    }
    const duplicate = await User.findOne({
      where: { [Op.or]: duplicateConditions }
    });
    if (duplicate) {
      if (duplicate.mobile === cleanMobile) {
        return res.status(409).json({ error: `An account with mobile number ${cleanMobile} already exists. Please sign in instead.` });
      }
      return res.status(409).json({ error: `An account with email ${cleanEmail} already exists. Please sign in instead.` });
    }

    // 4. Handle plan, seat and dates for student
    let planName = 'Monthly Plan';
    let effPlanId = planId || 'monthly';
    let baseFee = 1200;
    let cleanSeat = 'None';
    const cleanJoiningDate = getTodayDateString();
    let cleanExpiryDate = calculateExpiryDate(cleanJoiningDate, 1, 'Months');

    if (cleanRole === 'student') {
      if (planId) {
        const planRecord = await MembershipPlan.findByPk(planId);
        if (planRecord) {
          planName = planRecord.name;
          baseFee = Number(planRecord.price) || 1200;
          cleanExpiryDate = calculateExpiryDate(cleanJoiningDate, planRecord.duration, planRecord.duration_unit);
        }
      }

      // Check seat availability if preferredSeat is requested
      if (preferredSeat && preferredSeat !== 'None') {
        const seatCandidate = String(preferredSeat).trim().toUpperCase();
        const seatRecord = await Seat.findOne({ where: { number: seatCandidate } });
        if (seatRecord && seatRecord.status === 'available') {
          cleanSeat = seatCandidate;
          await Seat.update(
            { status: 'occupied', occupied_by: cleanName, assigned_until: cleanExpiryDate },
            { where: { number: seatCandidate } }
          );

          try {
            await SeatAllocation.create({
              id: `alloc-${Date.now()}`,
              user_id: '',
              user_name: cleanName,
              user_identifier: cleanMobile,
              seat_id: seatRecord.id,
              seat_number: cleanSeat,
              floor_id: seatRecord.floor_id,
              floor_name: seatRecord.floor_name || 'Floor',
              start_date: cleanJoiningDate,
              end_date: cleanExpiryDate,
              status: 'Active',
              action_type: 'Enrolled',
              notes: `Self-registered student for ${planName}`
            });
          } catch (e) {}
        }
      }
    } else {
      planName = 'Staff Access';
      effPlanId = 'staff';
      baseFee = 0;
      cleanExpiryDate = '2099-12-31';
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const userId = cleanRole === 'admin' 
      ? `usr-admin-${Date.now().toString().slice(-4)}`
      : `usr-${Date.now()}`;

    const newUser = await User.create({
      id: userId,
      name: cleanName,
      mobile: cleanMobile,
      email: cleanEmail,
      password: hashedPassword,
      role: cleanRole,
      address: address ? String(address).trim() : null,
      plan: planName,
      plan_id: effPlanId,
      seat: cleanSeat,
      joining_date: cleanJoiningDate,
      expiry_date: cleanExpiryDate,
      status: 'Active',
      base_fee: baseFee,
      discount: 0,
      discount_reason: null,
      final_fee: baseFee,
      paid_amount: 0,
      balance_due: baseFee,
      payment_status: baseFee === 0 ? 'Paid' : 'Pending',
      history: [`Account created via online registration on ${cleanJoiningDate}`]
    });

    // Update seat allocation with real userId if seat was assigned
    if (cleanSeat !== 'None') {
      try {
        await SeatAllocation.update(
          { user_id: newUser.id },
          { where: { seat_number: cleanSeat, status: 'Active', user_name: cleanName } }
        );
      } catch (e) {}
    }

    // Activity log
    try {
      await Activity.create({
        id: `act-${Date.now()}`,
        type: 'member_added',
        title: cleanRole === 'admin' ? 'New Administrator Registered' : 'New Member Self-Registered',
        timestamp: 'Just now',
        details: cleanRole === 'admin'
          ? `${cleanName} registered as staff administrator`
          : `${cleanName} self-enrolled for ${planName} · Seat ${cleanSeat}`,
        meta: { userName: cleanName, seatNumber: cleanSeat }
      });
    } catch (e) {}

    // Generate JWT token
    const token = generateToken({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email || '',
      mobile: newUser.mobile,
      role: newUser.role
    });

    res.status(201).json({
      success: true,
      message: cleanRole === 'admin' 
        ? 'Administrator account successfully created.' 
        : 'Student account successfully created.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        address: newUser.address,
        role: newUser.role,
        seat: newUser.seat,
        plan: newUser.plan,
        planId: newUser.plan_id,
        joiningDate: newUser.joining_date,
        expiryDate: newUser.expiry_date,
        status: newUser.status,
        baseFee: Number(newUser.base_fee) || 0,
        discount: 0,
        discountReason: '',
        finalFee: Number(newUser.final_fee) || 0,
        paidAmount: 0,
        balanceDue: Number(newUser.balance_due) || 0,
        paymentStatus: newUser.payment_status || 'Pending'
      }
    });
  } catch (error: any) {
    console.error('[Auth Error] Registration failed:', error.message);
    res.status(500).json({ error: error.message || 'Internal server error during registration.' });
  }
};
