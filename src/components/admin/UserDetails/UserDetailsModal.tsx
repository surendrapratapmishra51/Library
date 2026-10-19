import React from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, Armchair, Clock, History, Receipt } from 'lucide-react';
import { AdminUser } from '../../../types';

interface UserDetailsModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, user, onClose }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl font-display shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  {user.name}
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    user.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {user.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">ID: {user.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 text-xs">
          
          {/* Key cards: Seat & Plan */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px] mb-0.5">Assigned Desk:</span>
              <span className="font-mono font-bold text-base text-slate-900">
                {user.seat !== 'None' ? `Seat ${user.seat}` : 'None (Released)'}
              </span>
              {user.previousSeat && (
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Previous: Seat {user.previousSeat}
                </p>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px] mb-0.5">Membership Plan:</span>
              <span className="font-bold text-sm text-slate-900 block truncate">
                {user.plan}
              </span>
              <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                Exp: {user.expiryDate}
              </p>
            </div>
          </div>

          {/* Details list */}
          <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-100 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-mono font-medium">{user.mobile}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{user.email || 'No email registered'}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{user.address || 'Civil Lines / Local resident'}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Enrolled on {user.joiningDate}</span>
            </div>
          </div>

          {/* Fee & Payment Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                Fee & Payment Status
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                user.paymentStatus === 'Paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : user.paymentStatus === 'Partial'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {user.paymentStatus === 'Paid' ? 'Paid in Full' : user.paymentStatus === 'Partial' ? 'Partial Payment' : 'Payment Pending'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1 text-center">
              <div className="p-2 bg-white rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Plan Fee</span>
                <span className="font-mono font-bold text-slate-800">₹{user.baseFee ?? 0}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Discount</span>
                <span className="font-mono font-bold text-emerald-700">₹{user.discount ?? 0}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Paid</span>
                <span className="font-mono font-bold text-slate-800">₹{user.paidAmount ?? 0}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Balance Due</span>
                <span className={`font-mono font-bold ${(user.balanceDue || 0) > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
                  ₹{user.balanceDue ?? 0}
                </span>
              </div>
            </div>

            {user.discount && user.discount > 0 && user.discountReason && (
              <p className="text-[10px] text-slate-500 italic">
                Discount note: {user.discountReason}
              </p>
            )}
          </div>

          {/* History / Audit trail */}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs mb-2">
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Membership & Seat Activity History</span>
            </div>
            <div className="space-y-1.5">
              {(user.history && user.history.length > 0) ? (
                user.history.map((h, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-100/70 text-[11px] text-slate-600 border border-slate-200/60">
                    • {h}
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs italic">No prior change records.</p>
              )}
            </div>
          </div>

        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
};
