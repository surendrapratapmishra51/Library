import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertCircle, Receipt } from 'lucide-react';
import { AdminUser } from '../../../types';
import { useLibrary } from '../../../context/LibraryContext';
import { Button } from '../../common/Button';
import { calculateExpiryDate, getTodayDateString, isExpiryDateValid } from '../../../utils/dateUtils';

interface UserModalProps {
  isOpen: boolean;
  userToEdit: AdminUser | null;
  onClose: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, userToEdit, onClose }) => {
  const { seats, plans, addUser, editUser } = useLibrary();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: 'student123',
    address: '',
    planId: 'monthly',
    plan: 'Monthly Plan',
    seat: '',
    joiningDate: getTodayDateString(),
    expiryDate: '',
    status: 'Active' as 'Active' | 'Discontinued',
    baseFee: 1200,
    discount: 0,
    discountReason: '',
    finalFee: 1200,
    paidAmount: 1200,
    balanceDue: 0,
    paymentMethod: 'Cash',
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available seats plus the user's currently held seat (if editing)
  const availableSeats = seats.filter(
    (s) => s.status === 'available' || (userToEdit && s.number === userToEdit.seat)
  );

  // Only active plans for new memberships
  const activePlans = plans.filter((p) => p.status === 'Active' || (userToEdit && p.id === userToEdit.planId));

  useEffect(() => {
    if (userToEdit) {
      const p = plans.find((pl) => pl.id === userToEdit.planId);
      const bFee = userToEdit.baseFee ?? (p ? p.price : 1200);
      const disc = userToEdit.discount ?? 0;
      const fFee = userToEdit.finalFee ?? Math.max(0, bFee - disc);
      const pAmount = userToEdit.paidAmount ?? 0;
      const bDue = userToEdit.balanceDue ?? Math.max(0, fFee - pAmount);

      setFormData({
        name: userToEdit.name,
        mobile: userToEdit.mobile,
        email: userToEdit.email,
        password: '',
        address: userToEdit.address,
        planId: userToEdit.planId,
        plan: userToEdit.plan,
        seat: userToEdit.seat,
        joiningDate: userToEdit.joiningDate,
        expiryDate: userToEdit.expiryDate,
        status: userToEdit.status,
        baseFee: bFee,
        discount: disc,
        discountReason: userToEdit.discountReason || '',
        finalFee: fFee,
        paidAmount: pAmount,
        balanceDue: bDue,
        paymentMethod: 'Cash',
      });
    } else {
      const today = getTodayDateString();
      const initialPlan = activePlans[0] || plans[0];
      const initialExpiry = calculateExpiryDate(today, initialPlan);
      const bFee = initialPlan ? initialPlan.price : 1200;

      setFormData({
        name: '',
        mobile: '',
        email: '',
        password: 'student123',
        address: '',
        planId: initialPlan?.id || 'monthly',
        plan: initialPlan?.name || 'Monthly Plan',
        seat: availableSeats[0]?.number || '',
        joiningDate: today,
        expiryDate: initialExpiry,
        status: 'Active',
        baseFee: bFee,
        discount: 0,
        discountReason: '',
        finalFee: bFee,
        paidAmount: bFee, // Default full payment on new enrollment
        balanceDue: 0,
        paymentMethod: 'Cash',
      });
    }
    setErrorMsg(null);
  }, [userToEdit, isOpen, plans]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'planId') {
      const selectedPlan = plans.find((p) => p.id === value);
      const recalculatedExpiry = calculateExpiryDate(formData.joiningDate, selectedPlan);
      const newBaseFee = selectedPlan?.price || 0;
      const newFinalFee = Math.max(0, newBaseFee - formData.discount);
      const newPaidAmount = userToEdit ? Math.min(formData.paidAmount, newFinalFee) : newFinalFee;
      const newBalanceDue = Math.max(0, newFinalFee - newPaidAmount);

      setFormData((prev) => ({
        ...prev,
        planId: value,
        plan: selectedPlan?.name || prev.plan,
        expiryDate: recalculatedExpiry,
        baseFee: newBaseFee,
        finalFee: newFinalFee,
        paidAmount: newPaidAmount,
        balanceDue: newBalanceDue,
      }));
    } else if (name === 'joiningDate') {
      const currentPlan = plans.find((p) => p.id === formData.planId);
      const recalculatedExpiry = calculateExpiryDate(value, currentPlan);
      setFormData((prev) => ({
        ...prev,
        joiningDate: value,
        expiryDate: recalculatedExpiry
      }));
    } else if (name === 'discount') {
      const disc = Math.max(0, Number(value) || 0);
      const newFinalFee = Math.max(0, formData.baseFee - disc);
      const newPaidAmount = Math.min(formData.paidAmount, newFinalFee);
      const newBalanceDue = Math.max(0, newFinalFee - newPaidAmount);

      setFormData((prev) => ({
        ...prev,
        discount: disc,
        finalFee: newFinalFee,
        paidAmount: newPaidAmount,
        balanceDue: newBalanceDue,
      }));
    } else if (name === 'paidAmount') {
      const paid = value === '' ? 0 : Math.max(0, Number(value));
      const newBalanceDue = Math.max(0, formData.finalFee - paid);

      setFormData((prev) => ({
        ...prev,
        paidAmount: paid,
        balanceDue: newBalanceDue,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim()) {
      setErrorMsg('Please enter student full name.');
      return;
    }
    if (!formData.mobile.trim() || formData.mobile.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.joiningDate || !formData.joiningDate.trim()) {
      setErrorMsg('Please select a valid Joining Date.');
      return;
    }
    if (!formData.expiryDate || !formData.expiryDate.trim()) {
      setErrorMsg('Please select a valid Membership Expiry Date.');
      return;
    }
    if (!isExpiryDateValid(formData.joiningDate, formData.expiryDate)) {
      setErrorMsg('Membership Expiry Date must be later than Joining Date.');
      return;
    }
    if (formData.discount < 0) {
      setErrorMsg('Discount amount cannot be negative.');
      return;
    }
    if (formData.discount > formData.baseFee) {
      setErrorMsg(`Discount (₹${formData.discount}) cannot be greater than Standard Plan Fee (₹${formData.baseFee}).`);
      return;
    }
    if (formData.discount > 0 && !formData.discountReason.trim()) {
      setErrorMsg('Please enter a reason for applying student discount.');
      return;
    }
    if (formData.paidAmount < 0) {
      setErrorMsg('Amount received cannot be negative.');
      return;
    }
    if (formData.paidAmount > formData.finalFee) {
      setErrorMsg(`Amount received (₹${formData.paidAmount}) cannot exceed Final Payable Amount (₹${formData.finalFee}).`);
      return;
    }

    setIsSubmitting(true);

    try {
      if (userToEdit) {
        const result = await editUser(userToEdit.id, formData);
        if (!result.success) {
          setErrorMsg(result.message);
          return;
        }
      } else {
        const result = await addUser({
          ...formData,
          status: 'Active'
        });
        if (!result.success) {
          setErrorMsg(result.message);
          return;
        }
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-hidden">
      <div className="bg-white rounded-2xl max-w-2xl sm:max-w-3xl w-full shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header (Fixed at top) */}
        <div className="shrink-0 p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                {userToEdit ? 'Edit Student Member' : 'Add New Library Member'}
              </h3>
              <p className="text-xs text-slate-500">
                {userToEdit ? 'Update member profile or desk allocation' : 'Enroll a student and assign an individual study seat'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form id="user-modal-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Full Name & Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                name="mobile"
                required
                placeholder="10-digit mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
            </div>
          </div>

          {/* Email & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Residential Address
              </label>
              <input
                type="text"
                name="address"
                placeholder="Hostel or locality"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Account Login Password */}
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Account Login Password {userToEdit ? '(Leave blank to keep unchanged)' : '*'}</span>
              {!userToEdit && <span className="text-[10px] text-slate-400 font-normal">Default: student123</span>}
            </label>
            <input
              type="text"
              name="password"
              placeholder={userToEdit ? 'Enter new password if updating' : 'e.g. student123'}
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Student will use their Mobile / Email with this password to access the Student Portal.
            </p>
          </div>

          {/* Membership Plan & Assigned Seat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Membership Plan *
              </label>
              <select
                name="planId"
                value={formData.planId}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
              >
                {activePlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} (₹{plan.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Assigned Seat *</span>
                <span className="text-[10px] text-emerald-700 font-normal">
                  ({availableSeats.length} available)
                </span>
              </label>
              <select
                name="seat"
                required={formData.status === 'Active'}
                value={formData.seat}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono font-bold"
              >
                {formData.status === 'Discontinued' && <option value="None">None (Discontinued)</option>}
                <option value="">-- Choose Available Seat --</option>
                {availableSeats.map((s) => (
                  <option key={s.id} value={s.number}>
                    Seat {s.number} (Floor {s.floor} · Sec {s.section})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Joining Date & Expiry Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Joining Date (Start Date) *
              </label>
              <input
                type="date"
                name="joiningDate"
                required
                value={formData.joiningDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Changing start date recalculates the expiry date automatically.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700 uppercase tracking-wider">
                  Membership Expiry Date *
                </label>
                <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                  Editable
                </span>
              </div>
              <input
                type="date"
                name="expiryDate"
                required
                min={formData.joiningDate}
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Auto-calculated from plan. You can manually adjust if needed.
              </p>
            </div>
          </div>

          {/* Fee Payment & Discount Section */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                Fee Payment & Discount
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                Plan Fee: ₹{formData.baseFee}
              </span>
            </div>

            {/* Discount & Reason */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Individual Discount (₹)
                </label>
                <input
                  type="number"
                  name="discount"
                  min="0"
                  max={formData.baseFee}
                  value={formData.discount === 0 ? '' : formData.discount}
                  onChange={handleChange}
                  placeholder="0 (Optional in INR)"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Discount Reason {formData.discount > 0 ? '*' : ''}
                </label>
                <input
                  type="text"
                  name="discountReason"
                  value={formData.discountReason}
                  onChange={handleChange}
                  disabled={!formData.discount || formData.discount <= 0}
                  placeholder={formData.discount > 0 ? "e.g. Sibling / Early bird discount" : "Add discount first"}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>

            {/* Final Payable Amount & Amount Received */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
                <span className="text-[10px] text-slate-500 font-medium">Final Payable Amount</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  ₹{formData.finalFee}
                </span>
                <span className="text-[9px] text-slate-400">
                  (₹{formData.baseFee} Standard - ₹{formData.discount} Discount)
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Amount Received Now (₹) *</span>
                  <span className="text-[9px] text-slate-400">Full, partial, or 0</span>
                </label>
                <input
                  type="number"
                  name="paidAmount"
                  min="0"
                  max={formData.finalFee}
                  value={formData.paidAmount === 0 ? '0' : (formData.paidAmount || '')}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono font-bold"
                />
              </div>
            </div>

            {/* Payment Method & Balance Due */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 items-center">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Payment Mode
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  disabled={formData.paidAmount === 0}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 font-medium"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer / IMPS</option>
                </select>
              </div>

              <div className="p-2.5 rounded-lg border flex flex-col justify-between bg-white border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium">Balance Due</span>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold font-mono ${formData.balanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    ₹{formData.balanceDue}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    formData.balanceDue === 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : formData.paidAmount > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {formData.balanceDue === 0 ? 'Paid in Full' : formData.paidAmount > 0 ? 'Partial Payment' : 'Payment Pending'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic">
              Note: Membership duration and expiry depend on plan duration, not on the amount received.
            </p>
          </div>

          {/* Membership Status - Only shown when editing an existing member */}
          {userToEdit && (
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Membership Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
              >
                <option value="Active">Active (Occupying Assigned Seat)</option>
                <option value="Discontinued">Discontinued (Seat Released)</option>
              </select>
            </div>
          )}
        </form>

        {/* Modal Footer (Fixed at bottom) */}
        <div className="shrink-0 px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-end gap-3 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <Button
            type="submit"
            form="user-modal-form"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
          >
            {userToEdit ? 'Save Changes' : 'Enroll Member'}
          </Button>
        </div>
      </div>
    </div>
  );
};
