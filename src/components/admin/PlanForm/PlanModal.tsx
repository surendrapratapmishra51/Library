import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { MembershipPlan } from '../../../types';
import { useLibrary } from '../../../context/LibraryContext';
import { Button } from '../../common/Button';

interface PlanModalProps {
  isOpen: boolean;
  planToEdit: MembershipPlan | null;
  onClose: () => void;
}

export const PlanModal: React.FC<PlanModalProps> = ({ isOpen, planToEdit, onClose }) => {
  const { addPlan, editPlan } = useLibrary();

  const [formData, setFormData] = useState({
    name: '',
    price: 1200,
    durationNumber: 1,
    durationUnit: 'Months' as 'Days' | 'Months' | 'Years',
    description: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (planToEdit) {
      // Parse duration if it was a string like "1 Month" or number
      const numMatch = typeof planToEdit.duration === 'string' ? parseInt(planToEdit.duration) : planToEdit.duration;
      setFormData({
        name: planToEdit.name,
        price: planToEdit.price,
        durationNumber: isNaN(numMatch) ? 1 : numMatch,
        durationUnit: planToEdit.durationUnit || 'Months',
        description: planToEdit.description || '',
        status: planToEdit.status || 'Active'
      });
    } else {
      setFormData({
        name: '',
        price: 1000,
        durationNumber: 1,
        durationUnit: 'Months',
        description: '',
        status: 'Active'
      });
    }
    setErrorMsg(null);
  }, [planToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim()) {
      setErrorMsg('Please enter a plan name.');
      return;
    }
    if (formData.price <= 0) {
      setErrorMsg('Please enter a valid positive price.');
      return;
    }

    setIsLoading(true);

    const formattedDuration = `${formData.durationNumber} ${
      formData.durationNumber === 1
        ? formData.durationUnit.slice(0, -1)
        : formData.durationUnit
    }`;

    if (planToEdit) {
      const res = editPlan(planToEdit.id, {
        name: formData.name,
        price: Number(formData.price),
        duration: formattedDuration,
        durationUnit: formData.durationUnit,
        description: formData.description,
        status: formData.status
      });
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }
    } else {
      const res = addPlan({
        name: formData.name,
        price: Number(formData.price),
        duration: formattedDuration,
        durationUnit: formData.durationUnit,
        description: formData.description,
        status: formData.status,
        billingCycle: `for ${formattedDuration.toLowerCase()}`,
        features: [
          'Reserved individual desk & ergonomic chair',
          'High-speed 300 Mbps fiber Wi-Fi',
          'Full AC & continuous power backup',
          'RO chilled & hot water dispenser'
        ]
      });
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                {planToEdit ? 'Edit Membership Plan' : 'Create Physical Library Plan'}
              </h3>
              <p className="text-xs text-slate-500">
                Configure duration, subscription fee, and status
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

        <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Plan Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly Plan or 45-Day Exam Sprint"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Fee Price (₹) *
            </label>
            <input
              type="number"
              required
              min={100}
              placeholder="e.g. 1200"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Duration Count *
              </label>
              <input
                type="number"
                min={1}
                required
                value={formData.durationNumber}
                onChange={(e) => setFormData({ ...formData, durationNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Duration Unit *
              </label>
              <select
                value={formData.durationUnit}
                onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
              >
                <option value="Days">Days</option>
                <option value="Months">Months</option>
                <option value="Years">Years</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              placeholder="Features or shift access details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Plan Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            >
              <option value="Active">Active (Available for new member enrollment)</option>
              <option value="Inactive">Inactive (Disabled for new enrollments)</option>
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
              {planToEdit ? 'Save Changes' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
