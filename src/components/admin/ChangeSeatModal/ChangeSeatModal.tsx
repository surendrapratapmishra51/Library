import React, { useState } from 'react';
import { X, ArrowRightLeft, Armchair, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AdminUser } from '../../../types';
import { useLibrary } from '../../../context/LibraryContext';
import { Button } from '../../common/Button';

interface ChangeSeatModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
}

export const ChangeSeatModal: React.FC<ChangeSeatModalProps> = ({ isOpen, user, onClose }) => {
  const { seats, changeUserSeat } = useLibrary();
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !user) return null;

  // Filter only seats that are currently available
  const availableSeats = seats.filter((s) => s.status === 'available');

  const handleConfirm = () => {
    setErrorMsg(null);
    if (!selectedSeat) {
      setErrorMsg('Please select a new available seat from the list.');
      return;
    }

    setIsLoading(true);
    const res = changeUserSeat(user.id, selectedSeat);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Change Student Seat
              </h3>
              <p className="text-xs text-slate-500">
                Reassign desk for <strong className="text-slate-800">{user.name}</strong>
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
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="py-4 space-y-4 text-xs">
          {/* Current Assignment Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[11px]">Currently Occupied Desk:</span>
              <span className="font-mono font-bold text-base text-slate-900">
                Seat {user.seat}
              </span>
            </div>
            <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active Member
            </span>
          </div>

          {/* New Seat Selection */}
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Select New Available Seat *</span>
              <span className="text-emerald-700 font-normal">
                {availableSeats.length} vacant desks
              </span>
            </label>

            {availableSeats.length === 0 ? (
              <p className="text-xs text-rose-600 p-3 bg-rose-50 rounded-lg border border-rose-200">
                No vacant seats are currently available in the library.
              </p>
            ) : (
              <select
                value={selectedSeat}
                onChange={(e) => setSelectedSeat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono font-bold text-sm"
              >
                <option value="">-- Choose New Available Desk --</option>
                {availableSeats.map((s) => (
                  <option key={s.id} value={s.number}>
                    Seat {s.number} (Floor {s.floor} · Section {s.section})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Explanatory Synchronization Notice */}
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px] leading-relaxed">
            <p className="font-semibold mb-0.5">Automated Seat Synchronization:</p>
            • Old desk <strong className="font-mono">{user.seat}</strong> will automatically become <strong>Available</strong>.
            <br />
            • New desk <strong className="font-mono">{selectedSeat || 'selected'}</strong> will become <strong>Occupied</strong> by {user.name}.
          </div>
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
            type="button"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            disabled={!selectedSeat}
            onClick={handleConfirm}
          >
            Confirm Reassignment
          </Button>
        </div>
      </div>
    </div>
  );
};
