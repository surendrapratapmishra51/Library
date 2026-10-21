import React, { useState, useEffect, useMemo } from 'react';
import { X, Receipt, CheckCircle2, AlertCircle, ArrowRight, IndianRupee } from 'lucide-react';
import { AdminUser } from '../../../types';
import { Button } from '../../common/Button';
import { getTodayDateString } from '../../../utils/dateUtils';
import { paymentApi } from '../../../services/paymentApi';

interface RecordPaymentModalProps {
  isOpen: boolean;
  selectedUser: AdminUser | null;
  users: AdminUser[];
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  selectedUser,
  users,
  onClose,
  onPaymentSuccess,
}) => {
  const studentUsers = useMemo(() => {
    return users.filter((u) => u.role !== 'admin');
  }, [users]);

  const [targetUserId, setTargetUserId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [transactionId, setTransactionId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active target student
  const activeStudent = useMemo(() => {
    if (targetUserId) {
      return studentUsers.find((u) => u.id === targetUserId) || null;
    }
    if (selectedUser) {
      return selectedUser;
    }
    // Default to first student with pending dues if available
    const firstWithDue = studentUsers.find((u) => (Number(u.balanceDue) || 0) > 0);
    return firstWithDue || studentUsers[0] || null;
  }, [targetUserId, selectedUser, studentUsers]);

  // Sync state when modal opens or selectedUser changes
  useEffect(() => {
    if (isOpen) {
      const u = selectedUser || studentUsers.find((s) => (Number(s.balanceDue) || 0) > 0) || studentUsers[0];
      if (u) {
        setTargetUserId(u.id);
        const due = Number(u.balanceDue) || 0;
        setAmount(due > 0 ? String(due) : '');
      } else {
        setTargetUserId('');
        setAmount('');
      }
      setPaymentDate(getTodayDateString());
      setPaymentMethod('Cash');
      setTransactionId(`TXN-${Date.now().toString().slice(-6)}`);
      setNotes('');
      setErrorMsg(null);
      setIsSubmitting(false);
    }
  }, [isOpen, selectedUser, studentUsers]);

  if (!isOpen) return null;

  const baseFee = Number(activeStudent?.baseFee) || 0;
  const discount = Number(activeStudent?.discount) || 0;
  const finalFee = Number(activeStudent?.finalFee) || Math.max(0, baseFee - discount);
  const paidAmount = Number(activeStudent?.paidAmount) || 0;
  const balanceDue = Number(activeStudent?.balanceDue) || Math.max(0, finalFee - paidAmount);

  const numAmount = Number(amount) || 0;
  const newBalanceDue = Math.max(0, balanceDue - numAmount);

  const handlePayFullDue = () => {
    setAmount(String(balanceDue));
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) {
      setErrorMsg('Please select a student member.');
      return;
    }

    if (numAmount <= 0) {
      setErrorMsg('Payment amount must be greater than ₹0.');
      return;
    }

    if (numAmount > balanceDue) {
      setErrorMsg(`Payment amount cannot exceed the remaining balance due of ₹${balanceDue}.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await paymentApi.recordPayment({
        userId: activeStudent.id,
        amount: numAmount,
        paymentMethod,
        paymentDate,
        transactionId: transactionId.trim() || undefined,
        notes: notes.trim() || undefined
      });

      if (res.success) {
        onPaymentSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || 'Failed to record payment.');
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.error || err?.message || 'Failed to record payment.');
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
        aria-labelledby="record-payment-title"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 id="record-payment-title" className="text-base font-bold text-slate-900 font-display">
                Record Fee Payment
              </h2>
              <p className="text-xs text-slate-500">
                Collect installment or full membership fee payment
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
                  const due = Number(s.balanceDue) || 0;
                  setAmount(due > 0 ? String(due) : '');
                }
                setErrorMsg(null);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              {studentUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.mobile}) · Seat: {u.seat} · Due: ₹{u.balanceDue ?? 0}
                </option>
              ))}
            </select>
          </div>

          {/* Member Financial Summary Banner */}
          {activeStudent && (
            <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">
                  Plan: <strong className="text-slate-900">{activeStudent.plan || 'Plan'}</strong>
                </span>
                <span className="font-mono text-slate-500">
                  Standard Fee: ₹{baseFee}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-sky-800">
                  <span>
                    Applied Discount: {activeStudent.discountReason ? `(${activeStudent.discountReason})` : ''}
                  </span>
                  <span className="font-mono font-bold">-₹{discount}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-600">Final Payable: <strong>₹{finalFee}</strong></span>
                <span className="text-emerald-700 font-semibold">Already Paid: <strong>₹{paidAmount}</strong></span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-800">Outstanding Balance Due:</span>
                <span className={`font-mono text-sm font-extrabold ${balanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  ₹{balanceDue}
                </span>
              </div>
            </div>
          )}

          {balanceDue === 0 ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-emerald-900">Member Has No Pending Dues</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                All fees for this membership period have already been fully collected.
              </p>
            </div>
          ) : (
            <>
              {/* Payment Amount Field & Quick Button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Amount Received Now (₹) *
                  </label>
                  <button
                    type="button"
                    onClick={handlePayFullDue}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                  >
                    Pay Full Due (₹{balanceDue})
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-mono font-bold text-slate-400 text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={balanceDue}
                    required
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder={`Max ₹${balanceDue}`}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                {numAmount > 0 && numAmount <= balanceDue && (
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Remaining due after payment:</span>
                    <strong className={`font-mono ${newBalanceDue === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      ₹{newBalanceDue} {newBalanceDue === 0 ? '(Cleared)' : ''}
                    </strong>
                  </p>
                )}
              </div>

              {/* Payment Date & Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Payment Mode *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer / IMPS</option>
                  </select>
                </div>
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Transaction / Reference ID
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. TXN-123456, UPI-REF-987"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Receipt Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Installment 1 of 2, Google Pay receipt"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </>
          )}

          {/* Modal Footer */}
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

            {balanceDue > 0 && (
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                disabled={isSubmitting || numAmount <= 0 || numAmount > balanceDue}
                className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
              >
                <span>Record ₹{numAmount > 0 ? numAmount : 'Payment'}</span>
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
