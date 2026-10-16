import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { AdminUser } from '../../../types';
import { useLibrary } from '../../../context/LibraryContext';
import { Button } from '../../common/Button';

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
    address: '',
    planId: 'quarterly',
    plan: 'Quarterly Plan',
    seat: '',
    joiningDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Active' as 'Active' | 'Discontinued'
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
      setFormData({
        name: userToEdit.name,
        mobile: userToEdit.mobile,
        email: userToEdit.email,
        address: userToEdit.address,
        planId: userToEdit.planId,
        plan: userToEdit.plan,
        seat: userToEdit.seat,
        joiningDate: userToEdit.joiningDate,
        expiryDate: userToEdit.expiryDate,
        status: userToEdit.status
      });
    } else {
      setFormData({
        name: '',
        mobile: '',
        email: '',
        address: '',
        planId: activePlans[0]?.id || 'quarterly',
        plan: activePlans[0]?.name || 'Quarterly Plan',
        seat: availableSeats[0]?.number || '',
        joiningDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Active'
      });
    }
    setErrorMsg(null);
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'planId') {
      const selectedPlan = plans.find((p) => p.id === value);
      setFormData((prev) => ({
        ...prev,
        planId: value,
        plan: selectedPlan?.name || prev.plan
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    setIsSubmitting(true);

    if (userToEdit) {
      const result = editUser(userToEdit.id, formData);
      setIsSubmitting(false);
      if (!result.success) {
        setErrorMsg(result.message);
        return;
      }
    } else {
      const result = addUser(formData);
      setIsSubmitting(false);
      if (!result.success) {
        setErrorMsg(result.message);
        return;
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
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
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
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
                Joining Date *
              </label>
              <input
                type="date"
                name="joiningDate"
                required
                value={formData.joiningDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Membership Expiry Date *
              </label>
              <input
                type="date"
                name="expiryDate"
                required
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Status */}
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

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              {userToEdit ? 'Save Changes' : 'Enroll Member'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
