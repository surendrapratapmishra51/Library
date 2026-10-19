import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { User, Seat, Activity, MembershipPlan, Payment } from '../models/index.js';
import { calculateExpiryDate, isExpiryDateValid, isValidDateString, getTodayDateString } from '../utils/dateUtils.js';

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      where: { role: 'student' },
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      mobile: u.mobile,
      email: u.email,
      role: u.role,
      address: u.address,
      plan: u.plan,
      planId: u.plan_id,
      seat: u.seat,
      joiningDate: u.joining_date,
      expiryDate: u.expiry_date,
      status: u.status,
      previousSeat: u.previous_seat,
      discontinuedDate: u.discontinued_date,
      baseFee: Number(u.base_fee) || 0,
      discount: Number(u.discount) || 0,
      discountReason: u.discount_reason || '',
      finalFee: Number(u.final_fee) || 0,
      paidAmount: Number(u.paid_amount) || 0,
      balanceDue: Number(u.balance_due) || 0,
      paymentStatus: u.payment_status || 'Pending',
      history: typeof u.history === 'string' ? JSON.parse(u.history) : u.history || [],
      created_at: u.created_at
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      name, mobile, email, password, address, plan, planId, seat,
      joiningDate, expiryDate, status, role,
      baseFee, discount, discountReason, paidAmount, paymentMethod
    } = req.body;

    if (!name || !name.trim() || !mobile || !String(mobile).trim()) {
      return res.status(400).json({ error: 'Full Name and Mobile number are required.' });
    }

    const cleanName = name.trim();
    const cleanMobile = String(mobile).trim();
    const cleanEmail = email && typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;

    // Check duplicate mobile or email
    const duplicateConditions: any[] = [{ mobile: cleanMobile }];
    if (cleanEmail) {
      duplicateConditions.push({ email: cleanEmail });
    }

    const duplicate = await User.findOne({
      where: {
        [Op.or]: duplicateConditions
      }
    });

    if (duplicate) {
      if (duplicate.mobile === cleanMobile) {
        return res.status(409).json({ error: `A member with mobile number ${cleanMobile} already exists.` });
      }
      if (cleanEmail && duplicate.email === cleanEmail) {
        return res.status(409).json({ error: `A member with email ${cleanEmail} already exists.` });
      }
      return res.status(409).json({ error: 'A member with this mobile number or email already exists.' });
    }

    // Verify seat availability
    const cleanSeat = seat && seat !== 'None' ? seat.trim().toUpperCase() : 'None';
    if (cleanSeat !== 'None') {
      const seatRecord = await Seat.findOne({ where: { number: cleanSeat } });
      if (!seatRecord) {
        return res.status(400).json({ error: `Seat ${cleanSeat} does not exist in library layout.` });
      }
      if (seatRecord.status !== 'available') {
        return res.status(400).json({ error: `Seat ${cleanSeat} is currently ${seatRecord.status} (assigned to ${seatRecord.occupied_by || 'another member'}). Please choose an available seat.` });
      }
    }

    const rawPassword = password && String(password).trim() ? String(password).trim() : 'student123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const id = `usr-${Date.now()}`;
    const userRole = role === 'admin' ? 'admin' : 'student';

    // Validate joining date
    const cleanJoiningDate = joiningDate && isValidDateString(joiningDate)
      ? String(joiningDate).trim()
      : getTodayDateString();

    // Validate or calculate expiry date (Expiry continues to depend on plan duration & start date, not amount paid)
    let cleanExpiryDate: string;
    if (expiryDate && typeof expiryDate === 'string' && expiryDate.trim()) {
      const trimmedExp = expiryDate.trim();
      if (!isValidDateString(trimmedExp)) {
        return res.status(400).json({ error: 'Invalid Membership Expiry Date format (expected YYYY-MM-DD).' });
      }
      if (!isExpiryDateValid(cleanJoiningDate, trimmedExp)) {
        return res.status(400).json({ error: 'Membership Expiry Date must be later than Joining Date.' });
      }
      cleanExpiryDate = trimmedExp;
    } else {
      const planRecord = planId ? await MembershipPlan.findByPk(planId) : null;
      cleanExpiryDate = calculateExpiryDate(
        cleanJoiningDate,
        planRecord?.duration,
        planRecord?.duration_unit,
        planId || plan
      );
    }

    // 1. Fee Calculation & Discount Validation
    let cleanBaseFee = Number(baseFee);
    if (isNaN(cleanBaseFee) || cleanBaseFee < 0) {
      const pRecord = planId ? await MembershipPlan.findByPk(planId) : null;
      cleanBaseFee = pRecord ? Number(pRecord.price) : 0;
    }

    const cleanDiscount = Math.max(0, Number(discount) || 0);
    if (cleanDiscount > cleanBaseFee) {
      return res.status(400).json({ error: 'Discount amount cannot be greater than the Standard Plan Fee.' });
    }

    const cleanFinalFee = Math.max(0, cleanBaseFee - cleanDiscount);
    const cleanPaidAmount = Math.max(0, Number(paidAmount) || 0);

    if (cleanPaidAmount > cleanFinalFee) {
      return res.status(400).json({ error: 'Amount received cannot exceed the Final Payable Amount.' });
    }

    const cleanBalanceDue = Math.max(0, cleanFinalFee - cleanPaidAmount);

    let cleanPaymentStatus: 'Paid' | 'Partial' | 'Pending';
    if (cleanBalanceDue === 0 && (cleanFinalFee === 0 || cleanPaidAmount > 0)) {
      cleanPaymentStatus = 'Paid';
    } else if (cleanPaidAmount > 0 && cleanBalanceDue > 0) {
      cleanPaymentStatus = 'Partial';
    } else {
      cleanPaymentStatus = 'Pending';
    }

    const cleanDiscountReason = cleanDiscount > 0 && discountReason && String(discountReason).trim()
      ? String(discountReason).trim()
      : null;

    const history = [
      `Enrolled by Admin on ${cleanJoiningDate} (Assigned Seat: ${cleanSeat}, Plan: ${plan || 'Plan'}, Fee: ₹${cleanFinalFee}, Paid: ₹${cleanPaidAmount}, Due: ₹${cleanBalanceDue})`
    ];

    const newUser = await User.create({
      id,
      name: cleanName,
      mobile: cleanMobile,
      email: cleanEmail,
      password: hashedPassword,
      role: userRole,
      address: address ? address.trim() : '',
      plan: plan || 'Monthly Plan',
      plan_id: planId || 'monthly',
      seat: cleanSeat,
      joining_date: cleanJoiningDate,
      expiry_date: cleanExpiryDate,
      status: status || 'Active',
      base_fee: cleanBaseFee,
      discount: cleanDiscount,
      discount_reason: cleanDiscountReason,
      final_fee: cleanFinalFee,
      paid_amount: cleanPaidAmount,
      balance_due: cleanBalanceDue,
      payment_status: cleanPaymentStatus,
      history
    });

    // Mark seat as occupied
    if (cleanSeat !== 'None') {
      await Seat.update(
        { status: 'occupied', occupied_by: cleanName, assigned_until: cleanExpiryDate },
        { where: { number: cleanSeat } }
      );
    }

    // Requirement 8: Do not create a successful payment transaction when the received amount is zero
    if (cleanPaidAmount > 0) {
      try {
        await Payment.create({
          id: `pay-${Date.now()}`,
          user_id: id,
          user_name: cleanName,
          user_mobile: cleanMobile,
          plan_name: plan || 'Membership Plan',
          amount: cleanPaidAmount,
          payment_method: paymentMethod || 'Cash',
          payment_date: cleanJoiningDate,
          status: 'Completed',
          notes: `Initial fee collection for ${plan || 'Membership Plan'}${cleanDiscount > 0 ? ` (Discount: ₹${cleanDiscount}${cleanDiscountReason ? ` - ${cleanDiscountReason}` : ''})` : ''}`
        });
      } catch (payErr: any) {
        console.warn('[Payment Record Warning]:', payErr.message);
      }
    }

    // Log activity (resilient logging)
    try {
      await Activity.create({
        id: `act-${Date.now()}`,
        type: 'member_added',
        title: 'New Member Registered',
        timestamp: 'Just now',
        details: `${cleanName} enrolled for ${plan || 'Plan'} · Seat ${cleanSeat} · Paid: ₹${cleanPaidAmount}${cleanBalanceDue > 0 ? ` (Due: ₹${cleanBalanceDue})` : ''}`,
        meta: { userName: cleanName, seatNumber: cleanSeat, expiryDate: cleanExpiryDate, paidAmount: cleanPaidAmount, balanceDue: cleanBalanceDue }
      });
    } catch (actErr: any) {
      console.warn('[Activity Logging Warning]:', actErr.message);
    }

    res.status(201).json({
      success: true,
      message: `Account created for ${cleanName} with password "${rawPassword}".`,
      user: {
        id: newUser.id,
        name: newUser.name,
        mobile: newUser.mobile,
        email: newUser.email,
        role: newUser.role,
        address: newUser.address,
        plan: newUser.plan,
        planId: newUser.plan_id,
        seat: newUser.seat,
        joiningDate: newUser.joining_date,
        expiryDate: newUser.expiry_date,
        status: newUser.status,
        previousSeat: newUser.previous_seat,
        discontinuedDate: newUser.discontinued_date,
        baseFee: Number(newUser.base_fee) || 0,
        discount: Number(newUser.discount) || 0,
        discountReason: newUser.discount_reason || '',
        finalFee: Number(newUser.final_fee) || 0,
        paidAmount: Number(newUser.paid_amount) || 0,
        balanceDue: Number(newUser.balance_due) || 0,
        paymentStatus: newUser.payment_status || 'Pending',
        history: typeof newUser.history === 'string' ? JSON.parse(newUser.history) : newUser.history || [],
        created_at: newUser.created_at
      }
    });
  } catch (error: any) {
    console.error('[User Error] Failed to create member:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    // Validate dates if updating joining or expiry dates
    const effJoiningDate = fields.joiningDate ? String(fields.joiningDate).trim() : user.joining_date;
    const effExpiryDate = fields.expiryDate ? String(fields.expiryDate).trim() : user.expiry_date;

    if (fields.joiningDate && !isValidDateString(effJoiningDate)) {
      return res.status(400).json({ error: 'Invalid Joining Date format (expected YYYY-MM-DD).' });
    }
    if (fields.expiryDate && !isValidDateString(effExpiryDate)) {
      return res.status(400).json({ error: 'Invalid Membership Expiry Date format (expected YYYY-MM-DD).' });
    }
    if (effJoiningDate && effExpiryDate && !isExpiryDateValid(effJoiningDate, effExpiryDate)) {
      return res.status(400).json({ error: 'Membership Expiry Date must be later than Joining Date.' });
    }

    // Reallocate seat if changed
    if (fields.seat && fields.seat !== user.seat) {
      // Free old seat
      if (user.seat && user.seat !== 'None') {
        await Seat.update({ status: 'available', occupied_by: null, assigned_until: null }, { where: { number: user.seat } });
      }
      // Occupy new seat
      if (fields.seat !== 'None') {
        await Seat.update({ status: 'occupied', occupied_by: fields.name || user.name, assigned_until: effExpiryDate }, { where: { number: fields.seat } });
      }
    } else if (fields.expiryDate && user.seat && user.seat !== 'None') {
      // Update assigned_until if expiryDate was updated
      await Seat.update({ assigned_until: effExpiryDate }, { where: { number: user.seat } });
    }

    // Handle discontinuation
    if (fields.status === 'Discontinued' && user.status !== 'Discontinued') {
      if (user.seat && user.seat !== 'None') {
        await Seat.update({ status: 'available', occupied_by: null, assigned_until: null }, { where: { number: user.seat } });
      }
      fields.previous_seat = user.seat;
      fields.seat = 'None';
      fields.discontinued_date = new Date().toISOString().split('T')[0];
    }

    // Password hash if updating password
    if (fields.password && fields.password.trim()) {
      fields.password = await bcrypt.hash(fields.password.trim(), 10);
    } else {
      delete fields.password;
    }

    let updatedHistory = Array.isArray(user.history) ? user.history : [];
    if (fields.historyLog) {
      updatedHistory = [fields.historyLog, ...updatedHistory];
    }
    fields.history = updatedHistory;

    // Handle Fee & Payment updates if provided
    let newBaseFee = fields.baseFee !== undefined ? Number(fields.baseFee) : user.base_fee;
    let newDiscount = fields.discount !== undefined ? Number(fields.discount) : user.discount;
    let newDiscountReason = fields.discountReason !== undefined ? fields.discountReason : user.discount_reason;
    let newFinalFee = fields.finalFee !== undefined ? Number(fields.finalFee) : (Number(newBaseFee || 0) - Number(newDiscount || 0));
    let newPaidAmount = fields.paidAmount !== undefined ? Number(fields.paidAmount) : Number(user.paid_amount || 0);

    // If an additional payment is being collected for outstanding balance
    if (fields.additionalPayment && Number(fields.additionalPayment) > 0) {
      const addPay = Number(fields.additionalPayment);
      newPaidAmount = (Number(user.paid_amount) || 0) + addPay;
      try {
        await Payment.create({
          id: `pay-${Date.now()}`,
          user_id: user.id,
          user_name: user.name,
          user_mobile: user.mobile,
          plan_name: user.plan || 'Membership Plan',
          amount: addPay,
          payment_method: fields.paymentMethod || 'Cash',
          payment_date: getTodayDateString(),
          status: 'Completed',
          notes: fields.paymentNotes || `Balance fee collection for ${user.name}`
        });
      } catch (payErr: any) {
        console.warn('[Additional Payment Warning]:', payErr.message);
      }
    }

    const newBalanceDue = Math.max(0, (Number(newFinalFee) || 0) - (Number(newPaidAmount) || 0));
    let newPaymentStatus: 'Paid' | 'Partial' | 'Pending';
    if (newBalanceDue === 0 && ((Number(newFinalFee) || 0) === 0 || (Number(newPaidAmount) || 0) > 0)) {
      newPaymentStatus = 'Paid';
    } else if ((Number(newPaidAmount) || 0) > 0 && newBalanceDue > 0) {
      newPaymentStatus = 'Partial';
    } else {
      newPaymentStatus = 'Pending';
    }

    await user.update({
      name: fields.name ?? user.name,
      mobile: fields.mobile ?? user.mobile,
      email: fields.email ?? user.email,
      address: fields.address ?? user.address,
      password: fields.password ?? user.password,
      plan: fields.plan ?? user.plan,
      plan_id: fields.planId ?? user.plan_id,
      seat: fields.seat ?? user.seat,
      joining_date: fields.joiningDate ?? user.joining_date,
      expiry_date: effExpiryDate,
      status: fields.status ?? user.status,
      previous_seat: fields.previous_seat ?? user.previous_seat,
      discontinued_date: fields.discontinued_date ?? user.discontinued_date,
      base_fee: newBaseFee,
      discount: newDiscount,
      discount_reason: newDiscountReason,
      final_fee: newFinalFee,
      paid_amount: newPaidAmount,
      balance_due: newBalanceDue,
      payment_status: newPaymentStatus,
      history: updatedHistory
    });

    res.json({ success: true, message: 'Member details updated.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (user && user.seat && user.seat !== 'None') {
      await Seat.update({ status: 'available', occupied_by: null, assigned_until: null }, { where: { number: user.seat } });
    }

    if (user) {
      await user.destroy();
    }

    res.json({ success: true, message: 'Member deleted.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
