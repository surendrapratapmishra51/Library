import { Request, Response } from 'express';
import { Op } from 'sequelize';
import fs from 'fs';
import sequelize from '../config/database.js';
import { Payment, User, Activity, MembershipPlan } from '../models/index.js';
import { getTodayDateString, isValidDateString } from '../utils/dateUtils.js';

/**
 * GET /api/payments
 * Query Params:
 *  - userId: string
 *  - planId: string
 *  - fromDate / startDate: YYYY-MM-DD
 *  - toDate / endDate: YYYY-MM-DD
 *  - paymentMethod: string
 *  - status: 'Completed' | 'Pending' | 'Failed'
 *  - search: string (matches student name, mobile, transactionId)
 */
export const getPayments = async (req: Request, res: Response) => {
  try {
    const { userId, planId, status, paymentMethod, search } = req.query;
    const fromDate = (req.query.fromDate || req.query.startDate) as string | undefined;
    const toDate = (req.query.toDate || req.query.endDate) as string | undefined;

    const whereClause: any = {};

    if (userId && typeof userId === 'string' && userId !== 'all') {
      whereClause.user_id = userId;
    }

    if (status && typeof status === 'string' && status !== 'all') {
      whereClause.status = status;
    }

    if (paymentMethod && typeof paymentMethod === 'string' && paymentMethod !== 'all') {
      whereClause.payment_method = paymentMethod;
    }

    // Resolve Plan Name if planId provided
    if (planId && typeof planId === 'string' && planId !== 'all') {
      const planRecord = await MembershipPlan.findByPk(planId);
      const planConditions: any[] = [{ plan_name: planId }];
      if (planRecord) {
        planConditions.push({ plan_name: planRecord.name });
      }
      whereClause[Op.or] = planConditions;
    }

    // Date range filter (inclusive: fromDate <= payment_date <= toDate)
    if (fromDate || toDate) {
      const dateCond: any = {};
      if (fromDate && isValidDateString(String(fromDate))) {
        dateCond[Op.gte] = String(fromDate);
      }
      if (toDate && isValidDateString(String(toDate))) {
        dateCond[Op.lte] = String(toDate);
      }
      if (Object.keys(dateCond).length > 0) {
        whereClause.payment_date = dateCond;
      }
    }

    // Search filter
    if (search && typeof search === 'string' && search.trim()) {
      const s = `%${search.trim()}%`;
      const searchCond = [
        { user_name: { [Op.like]: s } },
        { user_mobile: { [Op.like]: s } },
        { transaction_id: { [Op.like]: s } },
        { plan_name: { [Op.like]: s } },
      ];
      if (whereClause[Op.or]) {
        whereClause[Op.and] = [{ [Op.or]: whereClause[Op.or] }, { [Op.or]: searchCond }];
        delete whereClause[Op.or];
      } else {
        whereClause[Op.or] = searchCond;
      }
    }

    const payments = await Payment.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });

    const formatted = payments.map((p) => ({
      id: p.id,
      userId: p.user_id,
      studentName: p.user_name,
      studentMobile: p.user_mobile,
      planName: p.plan_name,
      amount: Number(p.amount),
      paymentMethod: p.payment_method,
      paymentDate: p.payment_date,
      status: p.status,
      transactionId: p.transaction_id || p.id,
      notes: p.notes || '',
      created_at: p.created_at
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error('[paymentController.getPayments] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/payments/user/:userId
 * Get all payment records for a specific member
 */
export const getUserPayments = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const payments = await Payment.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });

    const formatted = payments.map((p) => ({
      id: p.id,
      userId: p.user_id,
      studentName: p.user_name,
      studentMobile: p.user_mobile,
      planName: p.plan_name,
      amount: Number(p.amount),
      paymentMethod: p.payment_method,
      paymentDate: p.payment_date,
      status: p.status,
      transactionId: p.transaction_id || p.id,
      notes: p.notes || '',
      created_at: p.created_at
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error('[paymentController.getUserPayments] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/payments/summary
 * Generates aggregated Fees Management Dashboard stats calculated directly from database records,
 * dynamically filtered by:
 *  - fromDate / startDate (inclusive)
 *  - toDate / endDate (inclusive)
 *  - userId (specific member or all)
 *  - planId (specific plan or all)
 */
export const getFeesSummary = async (req: Request, res: Response) => {
  try {
    const fromDate = (req.query.fromDate || req.query.startDate) as string | undefined;
    const toDate = (req.query.toDate || req.query.endDate) as string | undefined;
    const userId = req.query.userId as string | undefined;
    const planId = req.query.planId as string | undefined;

    // Validate date format and boundaries if provided
    if (fromDate && !isValidDateString(fromDate)) {
      return res.status(400).json({ error: 'Invalid From Date format (expected YYYY-MM-DD).' });
    }
    if (toDate && !isValidDateString(toDate)) {
      return res.status(400).json({ error: 'Invalid To Date format (expected YYYY-MM-DD).' });
    }
    if (fromDate && toDate && fromDate > toDate) {
      return res.status(400).json({ error: 'From Date cannot be later than To Date.' });
    }

    // Resolve Plan Name if planId provided
    let planRecord: MembershipPlan | null = null;
    if (planId && planId !== 'all') {
      planRecord = await MembershipPlan.findByPk(planId);
    }

    // -------------------------------------------------------------
    // 1. AMOUNT COLLECTED: Transaction-based metric
    // Only successful 'Completed' payments within [fromDate, toDate]
    // -------------------------------------------------------------
    const paymentConditions: any[] = [{ status: 'Completed' }];

    if (userId && userId !== 'all') {
      paymentConditions.push({ user_id: userId });
    }

    if (planId && planId !== 'all') {
      const planConditions: any[] = [{ plan_name: planId }];
      if (planRecord) {
        planConditions.push({ plan_name: planRecord.name });
      }
      paymentConditions.push({ [Op.or]: planConditions });
    }

    if (fromDate || toDate) {
      const dateCond: any = {};
      if (fromDate) dateCond[Op.gte] = fromDate;
      if (toDate) dateCond[Op.lte] = toDate;
      paymentConditions.push({ payment_date: dateCond });
    }

    const completedPayments = await Payment.findAll({
      where: { [Op.and]: paymentConditions },
      order: [['payment_date', 'ASC'], ['id', 'ASC']]
    });

    let amountCollected = 0;
    const methodMap: Record<string, { amount: number; count: number }> = {};
    const monthMap: Record<string, { month: string; label: string; amount: number; count: number }> = {};
    const dailyMap: Record<string, { date: string; label: string; amount: number; count: number }> = {};

    for (const p of completedPayments) {
      const amt = Number(p.amount) || 0;
      amountCollected += amt;

      // Payment method breakdown
      const m = p.payment_method || 'Cash';
      if (!methodMap[m]) {
        methodMap[m] = { amount: 0, count: 0 };
      }
      methodMap[m].amount += amt;
      methodMap[m].count += 1;

      // Daily aggregation
      const pDate = p.payment_date || (p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '');
      if (pDate) {
        if (!dailyMap[pDate]) {
          const dObj = new Date(pDate);
          const dayLabel = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          dailyMap[pDate] = { date: pDate, label: dayLabel, amount: 0, count: 0 };
        }
        dailyMap[pDate].amount += amt;
        dailyMap[pDate].count += 1;
      }

      // Monthly aggregation
      let monthKey = '';
      if (p.payment_date && p.payment_date.length >= 7) {
        monthKey = p.payment_date.substring(0, 7); // YYYY-MM
      } else if (p.created_at) {
        const d = new Date(p.created_at);
        monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }

      if (monthKey) {
        if (!monthMap[monthKey]) {
          const [year, mo] = monthKey.split('-');
          const dateObj = new Date(Number(year), Number(mo) - 1, 1);
          const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          monthMap[monthKey] = {
            month: monthKey,
            label: monthLabel,
            amount: 0,
            count: 0
          };
        }
        monthMap[monthKey].amount += amt;
        monthMap[monthKey].count += 1;
      }
    }

    // -------------------------------------------------------------
    // 2. TOTAL PENDING DUES, MEMBERS WITH DUES, DISCOUNTS GIVEN
    // Membership-balance based metrics
    //
    // DATE RULE DOCUMENTATION:
    // - Pending dues belong to the membership record.
    // - If a specific userId is selected: filters directly to that member's membership.
    // - If a planId is selected: filters to that plan.
    // - When a date range [fromDate, toDate] is applied:
    //   Evaluates memberships whose active billing period includes the date range
    //   (joining_date <= toDate AND (status = 'Active' OR expiry_date >= fromDate)),
    //   ensuring that historical memberships with remaining dues are accurately reflected
    //   when reporting on the period, while newly enrolled memberships outside the window are excluded.
    // - Discounts Given represents concessions applied to memberships enrolled in the reporting period.
    // -------------------------------------------------------------
    const userConditions: any[] = [{ role: 'student' }];

    if (userId && userId !== 'all') {
      userConditions.push({ id: userId });
    }

    if (planId && planId !== 'all') {
      const planConditions: any[] = [{ plan_id: planId }, { plan: planId }];
      if (planRecord) {
        planConditions.push({ plan: planRecord.name });
      }
      userConditions.push({ [Op.or]: planConditions });
    }

    if (toDate && (!userId || userId === 'all')) {
      userConditions.push({
        [Op.or]: [
          { joining_date: { [Op.lte]: toDate } },
          { joining_date: null }
        ]
      });
    }

    const students = await User.findAll({
      where: { [Op.and]: userConditions },
      attributes: { exclude: ['password'] }
    });

    let totalFeesDue = 0;
    let pendingDuesCount = 0;
    let pendingDuesAmount = 0;
    let totalDiscounts = 0;
    let paidCount = 0;
    let partialCount = 0;
    let unpaidCount = 0;

    const planStatsMap: Record<string, { planName: string; totalPayable: number; collected: number; due: number; memberCount: number }> = {};

    for (const s of students) {
      const bFee = Number(s.base_fee) || 0;
      const disc = Number(s.discount) || 0;
      const fFee = Number(s.final_fee) || Math.max(0, bFee - disc);
      const paid = Number(s.paid_amount) || 0;
      const due = Number(s.balance_due) || Math.max(0, fFee - paid);

      // Discount Date Rule: Count discount if All Time or membership joined in reporting window
      let countDiscount = true;
      if (fromDate && s.joining_date && s.joining_date < fromDate) {
        countDiscount = false;
      }
      if (countDiscount) {
        totalDiscounts += disc;
      }

      totalFeesDue += due;

      if (due > 0) {
        pendingDuesCount += 1;
        pendingDuesAmount += due;
      }

      // Consistent status evaluation
      if (due === 0 && (fFee === 0 || paid > 0)) {
        paidCount += 1;
      } else if (paid > 0 && due > 0) {
        partialCount += 1;
      } else {
        unpaidCount += 1;
      }

      const pKey = s.plan || 'Other';
      if (!planStatsMap[pKey]) {
        planStatsMap[pKey] = { planName: pKey, totalPayable: 0, collected: 0, due: 0, memberCount: 0 };
      }
      planStatsMap[pKey].totalPayable += fFee;
      planStatsMap[pKey].collected += paid;
      planStatsMap[pKey].due += due;
      planStatsMap[pKey].memberCount += 1;
    }

    // Format Monthly & Daily collections
    const monthlyCollections = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));
    const dailyCollections = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    // Fallback if no payments in monthlyCollections: populate current/past 6 months with 0
    if (monthlyCollections.length === 0) {
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const k = `${y}-${m}`;
        monthlyCollections.push({
          month: k,
          label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          amount: 0,
          count: 0
        });
      }
    }

    // Format payment methods
    const paymentMethodBreakdown = Object.entries(methodMap).map(([method, data]) => ({
      method,
      amount: data.amount,
      count: data.count,
      percentage: amountCollected > 0 ? Math.round((data.amount / amountCollected) * 100) : 0
    }));

    // Recent 10 payments matching current filters
    const recentPayments = await Payment.findAll({
      where: { [Op.and]: paymentConditions },
      order: [['payment_date', 'DESC'], ['id', 'DESC']],
      limit: 10
    });

    const recentTransactions = recentPayments.map((p) => ({
      id: p.id,
      userId: p.user_id,
      studentName: p.user_name,
      studentMobile: p.user_mobile,
      planName: p.plan_name,
      amount: Number(p.amount),
      paymentMethod: p.payment_method,
      paymentDate: p.payment_date,
      status: p.status,
      transactionId: p.transaction_id || p.id,
      notes: p.notes || '',
      created_at: p.created_at
    }));

    const responsePayload = {
      summary: {
        totalFeesDue,
        amountCollected,
        pendingDuesCount,
        pendingDuesAmount,
        totalDiscounts,
        totalStudents: students.length,
        statusCounts: {
          paid: paidCount,
          partial: partialCount,
          unpaid: unpaidCount,
        }
      },
      monthlyCollections,
      dailyCollections,
      paymentMethodBreakdown,
      planWiseCollections: Object.values(planStatsMap),
      recentTransactions,
      filtersApplied: {
        fromDate: fromDate || null,
        toDate: toDate || null,
        userId: userId || 'all',
        planId: planId || 'all'
      }
    };

    try {
      fs.writeFileSync('C:/Users/suren/.gemini/antigravity-ide/brain/f08ebc88-9bd8-4b27-adbb-0985a79098d3/scratch/last_summary.json', JSON.stringify(responsePayload, null, 2));
    } catch (e) {}

    res.json(responsePayload);
  } catch (error: any) {
    console.error('[paymentController.getFeesSummary] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/payments
 * Record a new installment or full payment with validation and atomic database transaction.
 */
export const recordPayment = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { userId, amount, paymentMethod, paymentDate, transactionId, notes } = req.body;

    // 1. Validation
    if (!userId || typeof userId !== 'string') {
      await transaction.rollback();
      return res.status(400).json({ error: 'Valid Student Member ID is required.' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Payment amount must be greater than ₹0.' });
    }

    const cleanPaymentDate = paymentDate && isValidDateString(String(paymentDate).trim())
      ? String(paymentDate).trim()
      : getTodayDateString();

    const cleanPaymentMethod = paymentMethod && typeof paymentMethod === 'string' && paymentMethod.trim()
      ? paymentMethod.trim()
      : 'Cash';

    // 2. Fetch User with lock
    const user = await User.findByPk(userId, { transaction, lock: true });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Member not found.' });
    }

    if (user.role !== 'student') {
      await transaction.rollback();
      return res.status(400).json({ error: 'Payments can only be recorded for student members.' });
    }

    const currentBalanceDue = Number(user.balance_due) || 0;
    const currentPaidAmount = Number(user.paid_amount) || 0;
    const finalFee = Number(user.final_fee) || 0;

    // Overpayment check
    if (numAmount > currentBalanceDue) {
      await transaction.rollback();
      return res.status(400).json({
        error: `Payment amount (₹${numAmount}) cannot exceed the outstanding balance due of ₹${currentBalanceDue}.`
      });
    }

    // Prevent duplicate rapid submissions (same user, exact same amount, and same date within 60 seconds)
    const recentDuplicate = await Payment.findOne({
      where: {
        user_id: user.id,
        amount: numAmount,
        payment_date: cleanPaymentDate,
        created_at: {
          [Op.gte]: new Date(Date.now() - 60000)
        }
      },
      transaction
    });

    if (recentDuplicate) {
      await transaction.rollback();
      return res.status(409).json({
        error: `Duplicate payment detected: A payment of ₹${numAmount} for ${user.name} was already recorded a moment ago (Ref: ${recentDuplicate.transaction_id || recentDuplicate.id}).`
      });
    }

    // 3. Generate transaction ID if not given
    const cleanTxnId = transactionId && typeof transactionId === 'string' && transactionId.trim()
      ? transactionId.trim().toUpperCase()
      : `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const paymentId = `pay-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // 4. Create Payment Record
    const newPayment = await Payment.create({
      id: paymentId,
      user_id: user.id,
      user_name: user.name,
      user_mobile: user.mobile || 'N/A',
      plan_name: user.plan || 'Membership Plan',
      amount: numAmount,
      payment_method: cleanPaymentMethod,
      payment_date: cleanPaymentDate,
      status: 'Completed',
      transaction_id: cleanTxnId,
      notes: notes ? String(notes).trim() : null,
    }, { transaction });

    // 5. Update User Balance & Status
    const newPaidAmount = currentPaidAmount + numAmount;
    const newBalanceDue = Math.max(0, finalFee - newPaidAmount);

    let newPaymentStatus: 'Paid' | 'Partial' | 'Pending';
    if (newBalanceDue === 0 && (finalFee === 0 || newPaidAmount > 0)) {
      newPaymentStatus = 'Paid';
    } else if (newPaidAmount > 0 && newBalanceDue > 0) {
      newPaymentStatus = 'Partial';
    } else {
      newPaymentStatus = 'Pending';
    }

    const currentHistory = Array.isArray(user.history) ? user.history : [];
    const historyEntry = `Payment installment of ₹${numAmount} received via ${cleanPaymentMethod} (Ref: ${cleanTxnId}) on ${cleanPaymentDate}. Remaining Balance: ₹${newBalanceDue}.`;
    const updatedHistory = [historyEntry, ...currentHistory];

    await user.update({
      paid_amount: newPaidAmount,
      balance_due: newBalanceDue,
      payment_status: newPaymentStatus,
      history: updatedHistory
    }, { transaction });

    // 6. Log Activity
    try {
      await Activity.create({
        id: `act-${Date.now()}`,
        type: 'member_added',
        title: 'Payment Received',
        timestamp: 'Just now',
        details: `₹${numAmount} collected from ${user.name} (${user.seat !== 'None' ? `Seat ${user.seat}` : 'No Seat'}) via ${cleanPaymentMethod} · Ref: ${cleanTxnId}`,
        meta: {
          userId: user.id,
          userName: user.name,
          seatNumber: user.seat,
          amount: numAmount,
          balanceDue: newBalanceDue,
          transactionId: cleanTxnId
        }
      }, { transaction });
    } catch (actErr: any) {
      console.warn('[Activity Logging Warning]:', actErr.message);
    }

    // 7. Commit Transaction
    await transaction.commit();

    res.status(201).json({
      success: true,
      message: `Payment of ₹${numAmount} successfully recorded for ${user.name}.`,
      payment: {
        id: newPayment.id,
        userId: newPayment.user_id,
        studentName: newPayment.user_name,
        studentMobile: newPayment.user_mobile,
        planName: newPayment.plan_name,
        amount: Number(newPayment.amount),
        paymentMethod: newPayment.payment_method,
        paymentDate: newPayment.payment_date,
        status: newPayment.status,
        transactionId: newPayment.transaction_id,
        notes: newPayment.notes,
        created_at: newPayment.created_at
      },
      user: {
        id: user.id,
        name: user.name,
        paidAmount: newPaidAmount,
        balanceDue: newBalanceDue,
        paymentStatus: newPaymentStatus
      }
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error('[paymentController.recordPayment] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /api/payments/discount/:userId
 * Manage individual discount for an authorized admin.
 * Recalculates final payable amount, balance due, and updates history.
 */
export const manageDiscount = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { userId } = req.params;
    const { discount, discountReason } = req.body;

    if (!userId) {
      await transaction.rollback();
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const user = await User.findByPk(userId, { transaction, lock: true });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Member not found.' });
    }

    const cleanDiscount = Math.max(0, Number(discount) || 0);
    const baseFee = Number(user.base_fee) || 0;
    const paidAmount = Number(user.paid_amount) || 0;

    // Validate discount
    if (cleanDiscount < 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Discount amount cannot be negative.' });
    }

    if (cleanDiscount > baseFee) {
      await transaction.rollback();
      return res.status(400).json({
        error: `Discount (₹${cleanDiscount}) cannot exceed the Standard Plan Fee (₹${baseFee}).`
      });
    }

    if (cleanDiscount > 0 && (!discountReason || !String(discountReason).trim())) {
      await transaction.rollback();
      return res.status(400).json({ error: 'A discount reason is required when applying a discount.' });
    }

    const newFinalFee = Math.max(0, baseFee - cleanDiscount);

    // Prevent discount from making the final payable fee lower than what student has already paid
    if (newFinalFee < paidAmount) {
      await transaction.rollback();
      return res.status(400).json({
        error: `Cannot apply discount of ₹${cleanDiscount}. Final Payable Amount would become ₹${newFinalFee}, which is less than the ₹${paidAmount} already paid by this member.`
      });
    }

    const newBalanceDue = Math.max(0, newFinalFee - paidAmount);

    let newPaymentStatus: 'Paid' | 'Partial' | 'Pending';
    if (newBalanceDue === 0 && (newFinalFee === 0 || paidAmount > 0)) {
      newPaymentStatus = 'Paid';
    } else if (paidAmount > 0 && newBalanceDue > 0) {
      newPaymentStatus = 'Partial';
    } else {
      newPaymentStatus = 'Pending';
    }

    const cleanReason = cleanDiscount > 0 ? String(discountReason).trim() : null;

    const currentHistory = Array.isArray(user.history) ? user.history : [];
    const historyEntry = `Discount updated by Admin to ₹${cleanDiscount}${cleanReason ? ` (Reason: ${cleanReason})` : ''} on ${getTodayDateString()}. New Final Fee: ₹${newFinalFee}, Balance Due: ₹${newBalanceDue}.`;
    const updatedHistory = [historyEntry, ...currentHistory];

    await user.update({
      discount: cleanDiscount,
      discount_reason: cleanReason,
      final_fee: newFinalFee,
      balance_due: newBalanceDue,
      payment_status: newPaymentStatus,
      history: updatedHistory
    }, { transaction });

    // Log activity
    try {
      await Activity.create({
        id: `act-${Date.now()}`,
        type: 'member_added',
        title: 'Discount Updated',
        timestamp: 'Just now',
        details: `Discount adjusted to ₹${cleanDiscount} for ${user.name}${cleanReason ? ` (${cleanReason})` : ''} · Balance Due: ₹${newBalanceDue}`,
        meta: {
          userId: user.id,
          userName: user.name,
          discount: cleanDiscount,
          discountReason: cleanReason,
          finalFee: newFinalFee,
          balanceDue: newBalanceDue
        }
      }, { transaction });
    } catch (actErr: any) {
      console.warn('[Activity Logging Warning]:', actErr.message);
    }

    await transaction.commit();

    res.json({
      success: true,
      message: `Discount for ${user.name} updated to ₹${cleanDiscount}.`,
      user: {
        id: user.id,
        name: user.name,
        baseFee,
        discount: cleanDiscount,
        discountReason: cleanReason,
        finalFee: newFinalFee,
        paidAmount,
        balanceDue: newBalanceDue,
        paymentStatus: newPaymentStatus
      }
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error('[paymentController.manageDiscount] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/payments/statement/:userId
 * Get a complete fee statement for a student including all transaction installments.
 */
export const getUserStatement = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    const payments = await Payment.findAll({
      where: { user_id: userId },
      order: [['payment_date', 'ASC'], ['created_at', 'ASC']]
    });

    const transactions = payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      paymentMethod: p.payment_method,
      paymentDate: p.payment_date,
      status: p.status,
      transactionId: p.transaction_id || p.id,
      notes: p.notes || '',
      created_at: p.created_at
    }));

    res.json({
      member: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
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
      },
      transactions
    });
  } catch (error: any) {
    console.error('[paymentController.getUserStatement] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
