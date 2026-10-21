import React, { useState, useMemo } from 'react';
import { X, Layers, AlertCircle, CheckCircle2, AlertTriangle, Building2 } from 'lucide-react';
import { useLibrary } from '../../../context/LibraryContext';
import { Button } from '../../common/Button';
import { BulkAddSeatsResponse } from '../../../services';

interface BulkSeatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkSeatModal: React.FC<BulkSeatModalProps> = ({ isOpen, onClose }) => {
  const { floors, bulkAddSeats } = useLibrary();

  const [floorId, setFloorId] = useState<string>('unassigned');
  const [prefix, setPrefix] = useState<string>('A');
  const [startNumber, setStartNumber] = useState<number>(1);
  const [count, setCount] = useState<number>(25);
  const [description, setDescription] = useState<string>('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [operationResult, setOperationResult] = useState<BulkAddSeatsResponse | null>(null);

  // Compute live preview of candidate seats
  const previewSeats = useMemo(() => {
    const list: string[] = [];
    const cleanPrefix = prefix.trim().toUpperCase();
    const safeCount = Math.min(Math.max(1, count || 1), 200);
    const safeStart = Math.max(1, startNumber || 1);

    for (let i = 0; i < safeCount; i++) {
      const val = safeStart + i;
      const numStr = val < 10 ? `0${val}` : `${val}`;
      list.push(`${cleanPrefix}${numStr}`);
    }
    return list;
  }, [prefix, startNumber, count]);

  if (!isOpen) return null;

  const handleReset = () => {
    setOperationResult(null);
    setErrorMsg(null);
    setPrefix('A');
    setStartNumber(1);
    setCount(25);
    setDescription('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setOperationResult(null);

    if (count < 1 || count > 200) {
      setErrorMsg('Number of seats must be between 1 and 200.');
      return;
    }

    if (startNumber < 1) {
      setErrorMsg('Starting number must be at least 1.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await bulkAddSeats({
        count,
        prefix: prefix.trim().toUpperCase(),
        startNumber,
        floorId: floorId === 'unassigned' ? null : floorId,
        description: description.trim() || undefined
      });

      setOperationResult(res);
      if (!res.success && res.createdCount === 0) {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Bulk creation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Bulk Add Physical Desks
              </h3>
              <p className="text-xs text-slate-500">
                Batch generate sequentially numbered desks into the library layout
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Operation Result Report */}
          {operationResult && (
            <div className={`p-4 rounded-xl border ${operationResult.createdCount > 0 ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'} space-y-2`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {operationResult.createdCount > 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                )}
                <span>{operationResult.message}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="p-2 bg-white/80 rounded-lg border border-black/5">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Requested</span>
                  <span className="font-bold text-base">{operationResult.requestedCount}</span>
                </div>
                <div className="p-2 bg-white/80 rounded-lg border border-black/5 text-emerald-700">
                  <span className="text-[10px] text-emerald-600 uppercase block font-semibold">Created</span>
                  <span className="font-bold text-base">{operationResult.createdCount}</span>
                </div>
                <div className="p-2 bg-white/80 rounded-lg border border-black/5 text-amber-700">
                  <span className="text-[10px] text-amber-600 uppercase block font-semibold">Skipped</span>
                  <span className="font-bold text-base">{operationResult.skippedCount}</span>
                </div>
              </div>

              {operationResult.skippedSeats && operationResult.skippedSeats.length > 0 && (
                <div className="pt-2 text-[11px]">
                  <p className="font-semibold text-amber-800 mb-1">Skipped seats (already exist in database):</p>
                  <div className="max-h-24 overflow-y-auto bg-white/90 p-2 rounded-lg border border-amber-200 font-mono text-[10px] space-y-0.5">
                    {operationResult.skippedSeats.map((s) => (
                      <div key={s.number} className="flex items-center justify-between text-slate-700">
                        <strong className="text-amber-900">{s.number}</strong>
                        <span className="text-slate-400">{s.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!operationResult && (
            <form id="bulk-seat-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Floor Selection */}
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

              {/* Grid: Prefix, Starting Number, Count */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Seat Prefix *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A, B, G"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Starting Number *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={startNumber}
                    onChange={(e) => setStartNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Number of Seats *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    required
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Optional Description */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Batch Description / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Quiet study wing with ergonomic chairs"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              {/* Live Preview Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-700 uppercase tracking-wider">
                    Generation Preview ({previewSeats.length} desks)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Range: {previewSeats[0]} → {previewSeats[previewSeats.length - 1]}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] leading-relaxed max-h-28 overflow-y-auto flex flex-wrap gap-1.5">
                  {previewSeats.map((num) => (
                    <span
                      key={num}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-800 font-bold"
                    >
                      {num}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">
                  Duplicate seat numbers will automatically be skipped without overwriting existing data.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            {operationResult ? 'Close' : 'Cancel'}
          </button>
          {!operationResult && (
            <Button
              type="submit"
              form="bulk-seat-form"
              variant="primary"
              size="sm"
              isLoading={isLoading}
            >
              Confirm & Bulk Create ({count} Seats)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
