import React, { useState } from 'react';
import { X, Armchair, AlertCircle, Building2 } from 'lucide-react';
import { SeatStatus } from '../../../types';
import { useLibrary } from '../../../context/LibraryContext';
import { Button } from '../../common/Button';

interface SeatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SeatModal: React.FC<SeatModalProps> = ({ isOpen, onClose }) => {
  const { floors, addSeat } = useLibrary();

  const [seatNumber, setSeatNumber] = useState('');
  const [floorId, setFloorId] = useState<string>('unassigned');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<SeatStatus>('available');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanNum = seatNumber.trim().toUpperCase();
    if (!cleanNum) {
      setErrorMsg('Please enter a valid seat number (e.g. A01 or 101).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await addSeat({
        number: cleanNum,
        floorId: floorId === 'unassigned' ? null : floorId,
        description: description.trim() || undefined,
        status
      });

      if (!res.success) {
        setErrorMsg(res.message);
        setIsLoading(false);
        return;
      }

      setSeatNumber('');
      setDescription('');
      setFloorId('unassigned');
      setStatus('available');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create seat.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Armchair className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Add Individual Desk
              </h3>
              <p className="text-xs text-slate-500">
                Register a new reading carrel into the library layout
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
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

        <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Seat Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. A01 or F1-01"
              value={seatNumber}
              onChange={(e) => setSeatNumber(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono font-bold text-sm"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Unique identifier for this reading desk.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Floor Location (Optional)</span>
            </label>
            <select
              value={floorId}
              onChange={(e) => setFloorId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            >
              <option value="unassigned">No Floor (Direct / Unassigned Location)</option>
              {floors.map((fl) => (
                <option key={fl.id} value={fl.id} disabled={fl.status === 'Inactive'}>
                  {fl.name} {fl.status === 'Inactive' ? '(Deactivated)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Desk Description / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Corner window desk with natural daylight"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Initial Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SeatStatus)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            >
              <option value="available">Available (Ready for assignment)</option>
              <option value="maintenance">Maintenance / Unavailable (Temporarily blocked)</option>
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
              isLoading={isLoading}
            >
              Add Seat to Library
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
