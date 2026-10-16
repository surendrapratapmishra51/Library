import React from 'react';
import { SeatGrid } from '../../components/SeatGrid/SeatGrid';
import { Link } from 'react-router-dom';
import { Armchair, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export const SeatsPage: React.FC = () => {
  const { stats } = useLibrary();

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase">
            Live Floor Plan & Matrix
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display mt-1">
            Real-Time Seat Availability
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Choose your preferred study desk. All carrels come equipped with dual power sockets, personal LED lamps, and acoustic foam partitions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/join"
            className="px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <span>Proceed to Registration</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Interactive Seat Matrix */}
      <SeatGrid />

      {/* Hall Guidelines & Desk Allocation Rules */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Desk Allocation & Reservation Policy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 leading-relaxed">
          <div>
            <strong className="text-slate-900 block mb-1">1. Fixed Desk Lock</strong>
            Once your enrollment is approved, your selected desk remains assigned exclusively to your name. No other student can sit at your reserved carrel during your shift.
          </div>
          <div>
            <strong className="text-slate-900 block mb-1">2. Seat Exchange Requests</strong>
            Need to shift from Floor 1 to Floor 2 or want a corner desk? Members can request a seat transfer anytime through the front desk subject to vacancy.
          </div>
          <div>
            <strong className="text-slate-900 block mb-1">3. Personal Lockers & Shelves</strong>
            Quarterly and yearly members receive complimentary under-desk or wall-mounted shelf space for reference volumes.
          </div>
        </div>
      </div>
    </div>
  );
};
