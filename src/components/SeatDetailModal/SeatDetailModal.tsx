import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle2, Zap, Sun, Shield, User, Calendar, ArrowRight } from 'lucide-react';
import { Seat } from '../../types';
import { useLibrary } from '../../context/LibraryContext';

interface SeatDetailModalProps {
  seat: Seat | null;
  onClose: () => void;
}

export const SeatDetailModal: React.FC<SeatDetailModalProps> = ({ seat, onClose }) => {
  const navigate = useNavigate();
  const { setSelectedSeatForBooking } = useLibrary();

  if (!seat) return null;

  const handleSelectSeat = () => {
    setSelectedSeatForBooking(seat);
    onClose();
    navigate(`/join?seat=${seat.number}`);
  };

  const isAvailable = seat.status === 'available';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold font-mono text-slate-900">
                Seat {seat.number}
              </h3>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  seat.status === 'available'
                    ? 'bg-emerald-100 text-emerald-800'
                    : seat.status === 'occupied'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {seat.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Floor {seat.floor} · Section {seat.section} · {seat.isCornerOrWindow ? 'Window/Corner Cubicle' : 'Inner Silent Zone'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content details */}
        <div className="py-5 space-y-4 text-sm">
          {/* Status Context */}
          {isAvailable ? (
            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs">Ready for Instant Allocation</p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  This seat is unreserved. You can secure this desk right now with any monthly or quarterly plan.
                </p>
              </div>
            </div>
          ) : seat.status === 'occupied' ? (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <User className="w-4 h-4" /> Allocated To:
                </span>
                <span className="font-semibold text-slate-900">{seat.occupiedBy || 'Enrolled Member'}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-4 h-4" /> Valid Until:
                </span>
                <span className="font-semibold text-slate-800">{seat.assignedUntil || 'Current Cycle'}</span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              This desk is temporarily scheduled for routine electrical switch and partition maintenance.
            </div>
          )}

          {/* Desk Amenities */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Included In This Carrel
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Dual Universal Plugs</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
                <Sun className="w-4 h-4 text-emerald-600" />
                <span>Warm LED Study Light</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Acoustic Partition</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>High-Back Mesh Chair</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>

          {isAvailable ? (
            <button
              onClick={handleSelectSeat}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Book Seat {seat.number}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Select Another Seat
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
