import { Request, Response } from 'express';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import { 
  sequelize, 
  AdmissionRequest, 
  User, 
  Seat, 
  SeatAllocation, 
  MembershipPlan, 
  Payment, 
  Activity,
  Floor 
} from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { calculateExpiryDate, getTodayDateString, isValidDateString } from '../utils/dateUtils.js';

/**
 * POST /api/admissions
 * Public submission of admission request from candidate enrollment form.
 */
export const createAdmissionRequest = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      name,
      mobile,
      email,
      dob,
      address,
      planId,
      preferredSeat,
      startDate,
      shiftTiming,
      notes,
    } = req.body;

    const applicantName = (fullName || name || '').trim();
    const applicantMobile = String(mobile || '').trim();
    const applicantEmail = email && typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
    const applicantAddress = address && typeof address === 'string' ? address.trim() : null;
    const applicantDob = dob && typeof dob === 'string' ? dob.trim() : null;
    const applicantNotes = notes && typeof notes === 'string' ? notes.trim() : null;
    const applicantShift = shiftTiming && typeof shiftTiming === 'string' ? shiftTiming.trim() : '24/7 All Day';

    // 1. Validations
    if (!applicantName) {
      return res.status(400).json({ error: 'Applicant full name is required.' });
    }
    if (!applicantMobile || applicantMobile.length < 10) {
      return res.status(400).json({ error: 'A valid 10-digit mobile number is required.' });
    }
    if (!planId) {
      return res.status(400).json({ error: 'Please select a valid membership plan.' });
    }

    // 2. Validate Membership Plan
    let planRecord = await MembershipPlan.findByPk(planId);
    if (!planRecord) {
      planRecord = await MembershipPlan.findOne({
        where: {
          [Op.or]: [
            { id: planId },
            { name: planId },
          ],
        },
      });
    }
    if (!planRecord) {
      planRecord = await MembershipPlan.findOne();
    }
    if (!planRecord) {
      return res.status(400).json({ error: 'The selected membership plan does not exist or has been retired.' });
    }

    // 3. Prevent duplicate active pending requests from the same mobile number
    const existingPending = await AdmissionRequest.findOne({
      where: {
        mobile: applicantMobile,
        status: 'Pending',
      },
    });

    if (existingPending) {
      return res.status(409).json({
        error: `An admission application for mobile number ${applicantMobile} is already pending administrator review. Please visit the reception or wait for contact.`,
        requestId: existingPending.id,
      });
    }

    // 4. Validate requested seat candidate
    let cleanSeat = 'None';
    if (preferredSeat && preferredSeat !== 'None' && String(preferredSeat).trim()) {
      cleanSeat = String(preferredSeat).trim().toUpperCase();
      const seatRecord = await Seat.findOne({ where: { number: cleanSeat } });
      if (!seatRecord) {
        cleanSeat = 'None';
      }
    }

    const cleanStartDate = startDate && isValidDateString(startDate)
      ? String(startDate).trim()
      : getTodayDateString();

    const id = `req-${Date.now()}`;

    // 5. Create pending admission request (DOES NOT OCCUPY SEAT)
    const newRequest = await AdmissionRequest.create({
      id,
      name: applicantName,
      mobile: applicantMobile,
      email: applicantEmail,
      dob: applicantDob,
      address: applicantAddress,
      plan_id: planRecord.id,
      plan_name: planRecord.name,
      preferred_seat: cleanSeat,
      start_date: cleanStartDate,
      shift_timing: applicantShift,
      notes: applicantNotes,
      status: 'Pending',
    });

    // 6. Log system activity for admin awareness
    try {
      await Activity.create({
        id: `act-${Date.now()}`,
        type: 'member_added',
        title: 'New Admission Request Received',
        details: `${applicantName} submitted admission application (${planRecord.name} · Desk ${cleanSeat})`,
        timestamp: 'Just now',
        meta: {
          requestId: newRequest.id,
          userName: applicantName,
          seatNumber: cleanSeat,
          plan: planRecord.name,
        },
      });
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: 'Admission application received successfully. Your desk reservation request is awaiting administrator approval.',
      request: newRequest,
    });
  } catch (error: any) {
    console.error('[Admission Controller] createAdmissionRequest error:', error);
    return res.status(500).json({ error: error.message || 'Failed to submit admission application.' });
  }
};

/**
 * GET /api/admissions
 * Retrieve admission requests with filtering, search, and metric counts.
 */
export const getAdmissionRequests = async (req: Request, res: Response) => {
  try {
    const { status, search, planId, from_date, to_date } = req.query;

    const whereClause: any = {};

    // Status filter
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Plan filter
    if (planId && planId !== 'all') {
      whereClause.plan_id = planId;
    }

    // Search query (name, mobile, email, preferred_seat)
    if (search && String(search).trim()) {
      const q = `%${String(search).trim()}%`;
      whereClause[Op.or] = [
        { name: { [Op.like]: q } },
        { mobile: { [Op.like]: q } },
        { email: { [Op.like]: q } },
        { preferred_seat: { [Op.like]: q } },
      ];
    }

    // Date range filter
    if (from_date && to_date) {
      whereClause.start_date = {
        [Op.between]: [String(from_date), String(to_date)],
      };
    } else if (from_date) {
      whereClause.start_date = { [Op.gte]: String(from_date) };
    } else if (to_date) {
      whereClause.start_date = { [Op.lte]: String(to_date) };
    }

    // Fetch requests
    const requests = await AdmissionRequest.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
    });

    // Compute metric summary counts
    const [pendingCount, acceptedCount, rejectedCount, totalCount] = await Promise.all([
      AdmissionRequest.count({ where: { status: 'Pending' } }),
      AdmissionRequest.count({ where: { status: 'Accepted' } }),
      AdmissionRequest.count({ where: { status: 'Rejected' } }),
      AdmissionRequest.count(),
    ]);

    const formatted = requests.map((r) => ({
      id: r.id,
      name: r.name,
      mobile: r.mobile,
      email: r.email,
      dob: r.dob,
      address: r.address,
      planId: r.plan_id,
      planName: r.plan_name,
      preferredSeat: r.preferred_seat,
      allocatedSeat: r.allocated_seat,
      startDate: r.start_date,
      shiftTiming: r.shift_timing,
      notes: r.notes,
      status: r.status,
      rejectionReason: r.rejection_reason,
      processedBy: r.processed_by,
      processedAt: r.processed_at,
      createdUserId: r.created_user_id,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    const statsPayload = {
      pendingCount,
      acceptedCount,
      rejectedCount,
      totalCount,
    };

    return res.json({
      success: true,
      requests: formatted,
      stats: statsPayload,
      counts: statsPayload,
    });
  } catch (error: any) {
    console.error('[Admission Controller] getAdmissionRequests error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch admission requests.' });
  }
};

/**
 * GET /api/admissions/:id
 * Retrieve a single admission request by ID.
 */
export const getAdmissionRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = await AdmissionRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({ error: 'Admission request not found.' });
    }

    return res.json({
      success: true,
      request: {
        id: request.id,
        name: request.name,
        mobile: request.mobile,
        email: request.email,
        dob: request.dob,
        address: request.address,
        planId: request.plan_id,
        planName: request.plan_name,
        preferredSeat: request.preferred_seat,
        allocatedSeat: request.allocated_seat,
        startDate: request.start_date,
        shiftTiming: request.shift_timing,
        notes: request.notes,
        status: request.status,
        rejectionReason: request.rejection_reason,
        processedBy: request.processed_by,
        processedAt: request.processed_at,
        createdUserId: request.created_user_id,
        createdAt: request.created_at,
        updatedAt: request.updated_at,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/admissions/:id/accept
 * Admin accepts an admission request, allocates the seat, and creates the student account.
 * Protected with Database Transaction and Concurrency Checks.
 */
export const acceptAdmissionRequest = async (req: AuthRequest, res: Response) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      allocatedSeat,
      allocatedPlanId,
      discount = 0,
      discountReason,
      paidAmount = 0,
      paymentMethod = 'Cash',
      password,
      notes,
    } = req.body;

    // 1. Fetch admission request
    const request = await AdmissionRequest.findByPk(id, { transaction: t, lock: true });
    if (!request) {
      await t.rollback();
      return res.status(404).json({ error: 'Admission request not found.' });
    }

    // Idempotency: If already accepted, return success with existing user details
    if (request.status === 'Accepted') {
      await t.rollback();
      const existingUser = request.created_user_id ? await User.findByPk(request.created_user_id) : null;
      return res.json({
        success: true,
        message: 'This admission request has already been accepted.',
        alreadyAccepted: true,
        user: existingUser,
      });
    }

    // 2. Determine target seat
    const candidateRaw = (allocatedSeat !== undefined && allocatedSeat !== null && String(allocatedSeat).trim())
      ? allocatedSeat
      : (req.body.seatNumber !== undefined && req.body.seatNumber !== null && String(req.body.seatNumber).trim())
      ? req.body.seatNumber
      : (request.preferred_seat || 'None');

    const seatCandidate = String(candidateRaw).trim().toUpperCase();

    let seatRecord: Seat | null = null;

    if (seatCandidate !== 'None') {
      // Recheck seat availability with lock
      seatRecord = await Seat.findOne({
        where: { number: seatCandidate },
        transaction: t,
        lock: true,
      });

      if (!seatRecord) {
        await t.rollback();
        return res.status(400).json({
          error: `Seat ${seatCandidate} does not exist in library layout.`,
        });
      }

      if (seatRecord.status !== 'available') {
        await t.rollback();
        return res.status(400).json({
          error: `Seat ${seatCandidate} is no longer available (currently ${seatRecord.status} by ${seatRecord.occupied_by || 'another member'}). Please choose another available seat or reject the request.`,
          seatUnavailable: true,
          currentStatus: seatRecord.status,
          occupiedBy: seatRecord.occupied_by,
        });
      }

      // Check inactive floor
      if (seatRecord.floor_id) {
        const floorRec = await Floor.findByPk(seatRecord.floor_id, { transaction: t });
        if (floorRec && floorRec.status === 'Inactive') {
          await t.rollback();
          return res.status(400).json({
            error: `Cannot assign seat on deactivated floor "${floorRec.name}". Please select a seat on an active floor.`,
          });
        }
      }
    }

    // 3. Plan & Dates Calculation
    const effectivePlanId = allocatedPlanId || request.plan_id;
    const planRecord = await MembershipPlan.findByPk(effectivePlanId, { transaction: t });
    if (!planRecord) {
      await t.rollback();
      return res.status(400).json({ error: 'Selected membership plan not found.' });
    }

    const cleanJoiningDate = request.start_date || getTodayDateString();
    const cleanExpiryDate = calculateExpiryDate(
      cleanJoiningDate,
      planRecord.duration,
      planRecord.duration_unit,
      planRecord.id
    );

    // 4. Financial Fee & Payment Calculation
    const baseFee = Number(planRecord.price) || 0;
    const cleanDiscount = Math.max(0, Number(discount) || 0);
    if (cleanDiscount > baseFee) {
      await t.rollback();
      return res.status(400).json({ error: 'Discount amount cannot be greater than Standard Plan Fee.' });
    }

    const finalFee = Math.max(0, baseFee - cleanDiscount);
    const cleanPaidAmount = Math.max(0, Number(paidAmount) || 0);

    if (cleanPaidAmount > finalFee) {
      await t.rollback();
      return res.status(400).json({ error: 'Amount received cannot exceed Final Payable Amount.' });
    }

    const balanceDue = Math.max(0, finalFee - cleanPaidAmount);
    let paymentStatus: 'Paid' | 'Partial' | 'Pending';
    if (balanceDue === 0 && (finalFee === 0 || cleanPaidAmount > 0)) {
      paymentStatus = 'Paid';
    } else if (cleanPaidAmount > 0 && balanceDue > 0) {
      paymentStatus = 'Partial';
    } else {
      paymentStatus = 'Pending';
    }

    const cleanDiscountReason = cleanDiscount > 0 && discountReason && String(discountReason).trim()
      ? String(discountReason).trim()
      : null;

    // 5. Create or activate Student User in MySQL
    let user = await User.findOne({
      where: { mobile: request.mobile },
      transaction: t,
    });

    const rawPassword = password && String(password).trim() ? String(password).trim() : 'student123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    if (!user) {
      const newUserId = `usr-${Date.now()}`;
      user = await User.create(
        {
          id: newUserId,
          name: request.name,
          mobile: request.mobile,
          email: request.email,
          password: hashedPassword,
          role: 'student',
          address: request.address || '',
          plan: planRecord.name,
          plan_id: planRecord.id,
          seat: seatCandidate,
          joining_date: cleanJoiningDate,
          expiry_date: cleanExpiryDate,
          status: 'Active',
          base_fee: baseFee,
          discount: cleanDiscount,
          discount_reason: cleanDiscountReason,
          final_fee: finalFee,
          paid_amount: cleanPaidAmount,
          balance_due: balanceDue,
          payment_status: paymentStatus,
          history: [
            `Admission request accepted on ${getTodayDateString()} by ${req.user?.name || 'Administrator'} (Seat: ${seatCandidate}, Plan: ${planRecord.name})`,
          ],
        },
        { transaction: t }
      );
    } else {
      // Update existing user with new admission plan & seat
      await user.update(
        {
          name: request.name,
          email: request.email || user.email,
          seat: seatCandidate,
          plan: planRecord.name,
          plan_id: planRecord.id,
          status: 'Active',
          joining_date: cleanJoiningDate,
          expiry_date: cleanExpiryDate,
          base_fee: baseFee,
          discount: cleanDiscount,
          discount_reason: cleanDiscountReason,
          final_fee: finalFee,
          paid_amount: cleanPaidAmount,
          balance_due: balanceDue,
          payment_status: paymentStatus,
        },
        { transaction: t }
      );
    }

    // 6. Occupy Seat and record Seat Allocation
    if (seatCandidate !== 'None' && seatRecord) {
      await Seat.update(
        {
          status: 'occupied',
          occupied_by: request.name,
          assigned_until: cleanExpiryDate,
        },
        { where: { number: seatCandidate }, transaction: t }
      );

      await SeatAllocation.create(
        {
          id: `alloc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          user_id: user.id,
          user_name: user.name,
          user_identifier: user.mobile || user.email,
          seat_id: seatRecord.id,
          seat_number: seatCandidate,
          floor_id: seatRecord.floor_id,
          floor_name: seatRecord.floor_name || 'Floor',
          start_date: cleanJoiningDate,
          end_date: cleanExpiryDate,
          status: 'Active',
          action_type: 'Enrolled',
          notes: `Admission application (${request.id}) approved`,
        },
        { transaction: t }
      );
    }

    // 7. Record payment transaction if amount was received
    if (cleanPaidAmount > 0) {
      const paymentRef = `TXN-${Date.now()}`;
      await Payment.create(
        {
          id: `pay-${Date.now()}`,
          user_id: user.id,
          user_name: user.name,
          user_mobile: user.mobile,
          plan_name: planRecord.name,
          amount: cleanPaidAmount,
          payment_date: getTodayDateString(),
          payment_method: paymentMethod || 'Cash',
          status: 'Completed',
          transaction_id: paymentRef,
          notes: `Initial fee payment recorded upon admission approval (${request.id})`,
        },
        { transaction: t }
      );
    }

    // 8. Update Admission Request status to 'Accepted'
    const adminName = req.user?.name || 'Administrator';
    await request.update(
      {
        status: 'Accepted',
        allocated_seat: seatCandidate,
        allocated_plan_id: planRecord.id,
        allocated_plan_name: planRecord.name,
        processed_by: adminName,
        processed_at: new Date(),
        created_user_id: user.id,
        notes: notes ? `${request.notes ? request.notes + ' | ' : ''}Admin Note: ${notes}` : request.notes,
      },
      { transaction: t }
    );

    // 9. Activity Log
    await Activity.create(
      {
        id: `act-${Date.now()}`,
        type: 'member_added',
        title: 'Admission Request Accepted',
        details: `${request.name} admission confirmed (${planRecord.name} · Seat ${seatCandidate}) by ${adminName}`,
        timestamp: 'Just now',
        meta: {
          requestId: request.id,
          userId: user.id,
          userName: user.name,
          seatNumber: seatCandidate,
          plan: planRecord.name,
          admin: adminName,
        },
      },
      { transaction: t }
    );

    // Commit transaction
    await t.commit();

    return res.json({
      success: true,
      message: `Admission request accepted! Student ${user.name} has been enrolled on Seat ${seatCandidate}.`,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        seat: user.seat,
        plan: user.plan,
        status: user.status,
      },
      requestId: request.id,
    });
  } catch (error: any) {
    await t.rollback();
    console.error('[Admission Controller] acceptAdmissionRequest error:', error);
    return res.status(500).json({ error: error.message || 'Failed to accept admission request.' });
  }
};

/**
 * POST /api/admissions/:id/reject
 * Admin rejects an admission request with an optional reason.
 */
export const rejectAdmissionRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, rejectionReason: bodyReason } = req.body;

    const request = await AdmissionRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ error: 'Admission request not found.' });
    }

    if (request.status === 'Accepted') {
      return res.status(400).json({ error: 'Cannot reject an admission request that has already been accepted.' });
    }

    // Idempotency: If already rejected
    if (request.status === 'Rejected') {
      return res.json({
        success: true,
        message: 'This admission request is already marked as rejected.',
        alreadyRejected: true,
      });
    }

    const rejectionReason = (bodyReason || reason || '').trim() || 'Admission request declined by library administration.';

    const adminName = req.user?.name || 'Administrator';

    await request.update({
      status: 'Rejected',
      rejection_reason: rejectionReason,
      processed_by: adminName,
      processed_at: new Date(),
    });

    // Log Activity
    try {
      await Activity.create({
        id: `act-${Date.now()}`,
        type: 'member_discontinued',
        title: 'Admission Request Rejected',
        details: `${request.name}'s admission application rejected (${rejectionReason}) by ${adminName}`,
        timestamp: 'Just now',
        meta: {
          requestId: request.id,
          userName: request.name,
          reason: rejectionReason,
          admin: adminName,
        },
      });
    } catch (e) {}

    return res.json({
      success: true,
      message: `Admission request for ${request.name} has been rejected.`,
      requestId: request.id,
    });
  } catch (error: any) {
    console.error('[Admission Controller] rejectAdmissionRequest error:', error);
    return res.status(500).json({ error: error.message || 'Failed to reject admission request.' });
  }
};
