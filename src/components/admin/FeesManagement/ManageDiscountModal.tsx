import React, { useState, useEffect, useMemo } from 'react';
import { X, Tag, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { AdminUser } from '../../../types';
import { Button } from '../../common/Button';
import { paymentApi } from '../../../services/paymentApi';

interface ManageDiscountModalProps {
  isOpen: boolean;
  selectedUser: AdminUser | null;
  users: AdminUser[];
  onClose: () => void;
  onDiscountSuccess: () => void;
}

export const ManageDiscountModal: React.FC<ManageDiscountModalProps> = ({
  isOpen,
  selectedUser,
  users,
  onClose,
  onDiscountSuccess
}) => {
  const studentUsers = useMemo(() => {
    return users.filter((u) => u.role !== 'admin');
  }, [users]);

  const [targetUserId, setTargetUserId] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<string>('');
  const [discountReason, setDiscountReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeStudent = useMemo(() => {
    if (targetUserId) {
      return studentUsers.find((u) => u.id === targetUserId) || null;
    }
    if (selectedUser) {
      return selectedUser;
    }
    return studentUsers[0] || null;
  }, [targetUserId, selectedUser, studentUsers]);

  useEffect(() => {
    if (isOpen) {
      const u = selectedUser || studentUsers[0];
      if (u) {
        setTargetUserId(u.id);
        const curDisc = Number(u.discount) || 0;
        setDiscountAmount(curDisc > 0 ? String(curDisc) : '');
        setDiscountReason(u.discountReason || '');
      } else {
        setTargetUserId('');
        setDiscountAmount('');
        setDiscountReason('');
      }
      setErrorMsg(null);
      setIsSubmitting(false);
    }
  }, [isOpen, selectedUser, studentUsers]);

  if (!isOpen) return null;

  const baseFee = Number(activeStudent?.baseFee) || 0;
  const currentDiscount = Number(activeStudent?.discount) || 0;
  const paidAmount = Number(activeStudent?.paidAmount) || 0;

  const numNewDiscount = Number(discountAmount) || 0;
  const newFinalFee = Math.max(0, baseFee - numNewDiscount);
  const newBalanceDue = Math.max(0, newFinalFee - paidAmount);

  // Maximum allowed discount is baseFee - paidAmount (cannot discount below what student has paid)
  const maxAllowedDiscount = Math.max(0, baseFee - paidAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) {
      setErrorMsg('Please select a student member.');
      return;
    }

    if (numNewDiscount < 0) {
      setErrorMsg('Discount amount cannot be negative.');
      return;
    }

    if (numNewDiscount > baseFee) {
      setErrorMsg(`Discount (₹${numNewDiscount}) cannot exceed the Standard Fee of ₹${baseFee}.`);
      return;
    }

    if (numNewDiscount > maxAllowedDiscount) {
      setErrorMsg(`Cannot apply discount of ₹${numNewDiscount}. The student has already paid ₹${paidAmount}, so maximum concession possible is ₹${maxAllowedDiscount}.`);
      return;
    }

    if (numNewDiscount > 0 && (!discountReason || !discountReason.trim())) {
      setErrorMsg('A discount reason is required when applying a discount.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await paymentApi.manageDiscount(activeStudent.id, {
        discount: numNewDiscount,
        discountReason: numNewDiscount > 0 ? discountReason.trim() : ''
      });

      if (res.success) {
        onDiscountSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || 'Failed to update discount.');
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.error || err?.message || 'Failed to update discount.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-discount-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 id="manage-discount-title" className="text-base font-bold text-slate-900 font-display">
                Manage Member Discount
              </h2>
              <p className="text-xs text-slate-500">
                Apply or adjust individual concession without modifying standard plan pricing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Member Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Student Member *
            </label>
            <select
              value={activeStudent?.id || ''}
              onChange={(e) => {
                setTargetUserId(e.target.value);
                const s = studentUsers.find((u) => u.id === e.target.value);
                if (s) {
                  const d = Number(s.discount) || 0;
                  setDiscountAmount(d > 0 ? String(d) : '');
                  setDiscountReason(s.discountReason || '');
                }
                setErrorMsg(null);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
            >
              {studentUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.mobile}) · Plan: {u.plan} (₹{u.baseFee})
                </option>
              ))}
            </select>
          </div>

          {/* Current Breakdown Banner */}
          {activeStudent && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Standard Plan Fee:</span>
                <span className="font-mono font-bold text-slate-900">₹{baseFee}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">Currently Applied Discount:</span>
                <span className="font-mono font-semibold text-sky-700">
                  {currentDiscount > 0 ? `₹${currentDiscount}` : '₹0 (None)'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-600">Amount Already Paid:</span>
                <span className="font-mono font-bold text-emerald-700">₹{paidAmount}</span>
              </div>
            </div>
          )}

          {/* Discount Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>New Concession / Discount Amount (₹)</span>
              <span className="text-[10px] text-slate-400 font-normal">
                Max Allowed: ₹{maxAllowedDiscount}
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 font-mono font-bold text-slate-400 text-sm">
                ₹
              </span>
              <input
                type="number"
                min="0"
                max={maxAllowedDiscount}
                value={discountAmount}
                onChange={(e) => {
                  setDiscountAmount(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="0 (Enter discount in INR)"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Set to 0 to remove any existing discount.
            </p>
          </div>

          {/* Discount Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Discount Reason {numNewDiscount > 0 ? '*' : '(Optional)'}
            </label>
            <input
              type="text"
              required={numNewDiscount > 0}
              value={discountReason}
              onChange={(e) => {
                setDiscountReason(e.target.value);
                setErrorMsg(null);
              }}
              placeholder="e.g. Sibling discount, Economically weaker section, Early bird offer"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
            />
          </div>

          {/* Recalculation Preview Banner */}
          <div className="p-3.5 bg-sky-50/70 rounded-xl border border-sky-200/80 text-xs space-y-2">
            <span className="text-[10px] font-bold text-sky-900 uppercase tracking-wider block">
              Recalculation Preview
            </span>

            <div className="flex items-center justify-between text-slate-700">
              <span>Standard Fee:</span>
              <span className="font-mono">₹{baseFee}</span>
            </div>

            <div className="flex items-center justify-between text-sky-800 font-semibold">
              <span>Applied Discount:</span>
              <span className="font-mono">-₹{numNewDiscount}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-sky-200 font-bold text-slate-900">
              <span>Recalculated Final Payable:</span>
              <span className="font-mono text-sm">₹{newFinalFee}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-sky-200 font-bold">
              <span>Updated Balance Due:</span>
              <span className={`font-mono text-sm ${newBalanceDue > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                ₹{newBalanceDue}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              className="bg-sky-600 hover:bg-sky-700 font-semibold"
            >
              <span>Save Discount</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
