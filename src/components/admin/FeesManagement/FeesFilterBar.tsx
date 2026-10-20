import React, { useState, useEffect } from 'react';
import { Filter, Calendar, User, BookOpen, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { AdminUser, MembershipPlan } from '../../../types';
import { Button } from '../../common/Button';
import { getTodayDateString, isValidDateString } from '../../../utils/dateUtils';

export interface FeesFilterValues {
  datePreset: 'today' | 'this-month' | 'all-time' | 'custom';
  fromDate: string;
  toDate: string;
  userId: string;
  planId: string;
}

interface FeesFilterBarProps {
  users: AdminUser[];
  plans: MembershipPlan[];
  initialFilters: FeesFilterValues;
  onApplyFilters: (filters: FeesFilterValues) => void;
  isLoading?: boolean;
}

export const FeesFilterBar: React.FC<FeesFilterBarProps> = ({
  users,
  plans,
  initialFilters,
  onApplyFilters,
  isLoading = false
}) => {
  const [datePreset, setDatePreset] = useState<'today' | 'this-month' | 'all-time' | 'custom'>(initialFilters.datePreset);
  const [fromDate, setFromDate] = useState<string>(initialFilters.fromDate);
  const [toDate, setToDate] = useState<string>(initialFilters.toDate);
  const [userId, setUserId] = useState<string>(initialFilters.userId);
  const [planId, setPlanId] = useState<string>(initialFilters.planId);
  const [dateError, setDateError] = useState<string | null>(null);

  // Student users only for the user filter
  const studentUsers = users.filter((u) => u.role !== 'admin');

  // Compute preset ranges
  const computePresetDates = (preset: 'today' | 'this-month' | 'all-time'): { from: string; to: string } => {
    const today = new Date();
    const todayStr = getTodayDateString();

    if (preset === 'today') {
      return { from: todayStr, to: todayStr };
    }
    if (preset === 'this-month') {
      const year = today.getFullYear();
      const month = today.getMonth(); // 0-indexed
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0); // last day of month
      const fromStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const toStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
      return { from: fromStr, to: toStr };
    }
    // all-time
    return { from: '', to: '' };
  };

  // Sync state if initialFilters changes
  useEffect(() => {
    setDatePreset(initialFilters.datePreset);
    setFromDate(initialFilters.fromDate);
    setToDate(initialFilters.toDate);
    setUserId(initialFilters.userId);
    setPlanId(initialFilters.planId);
    setDateError(null);
  }, [initialFilters]);

  // Handle Preset Clicks
  const handleSelectPreset = (preset: 'today' | 'this-month' | 'all-time') => {
    const { from, to } = computePresetDates(preset);
    setDatePreset(preset);
    setFromDate(from);
    setToDate(to);
    setDateError(null);

    // Auto-apply or let user click apply
    onApplyFilters({
      datePreset: preset,
      fromDate: from,
      toDate: to,
      userId,
      planId
    });
  };

  // Handle Date input change (switches preset to 'custom')
  const handleFromDateChange = (val: string) => {
    setFromDate(val);
    setDatePreset('custom');
    if (val && toDate && val > toDate) {
      setDateError('From Date cannot be later than To Date.');
    } else {
      setDateError(null);
    }
  };

  const handleToDateChange = (val: string) => {
    setToDate(val);
    setDatePreset('custom');
    if (fromDate && val && fromDate > val) {
      setDateError('From Date cannot be later than To Date.');
    } else {
      setDateError(null);
    }
  };

  // Handle Apply button
  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (fromDate && toDate && fromDate > toDate) {
      setDateError('From Date cannot be later than To Date.');
      return;
    }
    setDateError(null);
    onApplyFilters({
      datePreset,
      fromDate,
      toDate,
      userId,
      planId
    });
  };

  // Handle Reset button -> restores default view: This Month + All Users + All Plans
  const handleReset = () => {
    const { from, to } = computePresetDates('this-month');
    setDatePreset('this-month');
    setFromDate(from);
    setToDate(to);
    setUserId('all');
    setPlanId('all');
    setDateError(null);

    onApplyFilters({
      datePreset: 'this-month',
      fromDate: from,
      toDate: to,
      userId: 'all',
      planId: 'all'
    });
  };

  const hasActiveCustomFilters =
    datePreset !== 'this-month' ||
    userId !== 'all' ||
    planId !== 'all';

  return (
    <div className="bg-white rounded-2xl border border-sky-200/80 shadow-xs p-4 sm:p-5 text-slate-800 space-y-4">
      {/* Top Bar: Title & Preset Date Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-100/80 text-sky-700 flex items-center justify-center font-bold">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <span>Financial Dashboard Filters</span>
              {hasActiveCustomFilters && (
                <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full border border-sky-200">
                  Filtered View
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Filter collections, dues, discounts, ledger, and charts across time and member profiles
            </p>
          </div>
        </div>

        {/* Date Presets Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start lg:self-auto">
          <button
            type="button"
            onClick={() => handleSelectPreset('today')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              datePreset === 'today'
                ? 'bg-white text-sky-700 shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('this-month')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              datePreset === 'this-month'
                ? 'bg-white text-sky-700 shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('all-time')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              datePreset === 'all-time'
                ? 'bg-white text-sky-700 shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Time
          </button>
          {datePreset === 'custom' && (
            <span className="px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 rounded-lg border border-amber-200">
              Custom Range
            </span>
          )}
        </div>
      </div>

      {/* Date Validation Alert if any */}
      {dateError && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{dateError}</span>
        </div>
      )}

      {/* Filter Inputs Grid */}
      <form onSubmit={handleApply} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        {/* From Date */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>From Date</span>
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => handleFromDateChange(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
          />
        </div>

        {/* To Date */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>To Date</span>
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => handleToDateChange(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
          />
        </div>

        {/* Student User Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400" />
            <span>User / Student</span>
          </label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
          >
            <option value="all">All Users (All Students)</option>
            {studentUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.mobile || u.id})
              </option>
            ))}
          </select>
        </div>

        {/* Membership Plan Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-slate-400" />
            <span>Membership Plan</span>
          </label>
          <select
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
          >
            <option value="all">All Plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (₹{p.price})
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons: Apply & Reset */}
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isLoading || Boolean(dateError)}
            isLoading={isLoading}
            className="flex-1 bg-sky-600 hover:bg-sky-700 font-semibold text-xs h-8.5"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            <span>Apply</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isLoading}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs h-8.5"
            title="Reset to default: This Month + All Users + All Plans"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>Reset</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
