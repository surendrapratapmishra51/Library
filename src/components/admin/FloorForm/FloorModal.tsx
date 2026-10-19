import React, { useState, useEffect } from 'react';
import { X, Building2, AlertCircle } from 'lucide-react';
import { Floor } from '../../../types';
import { useLibrary } from '../../../context/LibraryContext';
import { Button } from '../../common/Button';

interface FloorModalProps {
  isOpen: boolean;
  floorToEdit: Floor | null;
  onClose: () => void;
}

export const FloorModal: React.FC<FloorModalProps> = ({ isOpen, floorToEdit, onClose }) => {
  const { addFloor, editFloor } = useLibrary();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (floorToEdit) {
      setName(floorToEdit.name);
      setDescription(floorToEdit.description || '');
      setStatus(floorToEdit.status);
      setSortOrder(floorToEdit.sortOrder || 1);
    } else {
      setName('');
      setDescription('');
      setStatus('Active');
      setSortOrder(1);
    }
    setErrorMsg(null);
    setWarningMsg(null);
  }, [floorToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setWarningMsg(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg('Floor name is required (e.g. Ground Floor, Second Floor).');
      return;
    }

    setIsLoading(true);
    try {
      if (floorToEdit) {
        const res = await editFloor(floorToEdit.id, {
          name: cleanName,
          description: description.trim() || undefined,
          status,
          sortOrder: Number(sortOrder) || 1,
        });

        if (!res.success) {
          setErrorMsg(res.message);
          setIsLoading(false);
          return;
        }

        if (res.warning) {
          setWarningMsg(res.warning);
        }
      } else {
        const res = await addFloor({
          name: cleanName,
          description: description.trim() || undefined,
          status,
          sortOrder: Number(sortOrder) || 1,
        });

        if (!res.success) {
          setErrorMsg(res.message);
          setIsLoading(false);
          return;
        }
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save floor.');
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
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                {floorToEdit ? 'Edit Floor' : 'Add New Library Floor'}
              </h3>
              <p className="text-xs text-slate-500">
                {floorToEdit ? `Updating ${floorToEdit.name}` : 'Define a physical level in the library building'}
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

        {warningMsg && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{warningMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Floor Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ground Floor, First Floor, Mezzanine"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Unique floor name. Duplicate names within the library are automatically prevented.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Main quiet hall with 50 carrels and air conditioning"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Floor Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
              >
                <option value="Active">Active (Accepts Allocations)</option>
                <option value="Inactive">Inactive (Deactivated)</option>
              </select>
            </div>
          </div>

          {floorToEdit && status === 'Inactive' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-relaxed">
              <span className="font-semibold block mb-0.5">Floor Deactivation Note:</span>
              Deactivating this floor will prevent new seat assignments on it. Existing occupied seats and member allocations remain preserved.
            </div>
          )}

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
              {floorToEdit ? 'Save Changes' : 'Create Floor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
