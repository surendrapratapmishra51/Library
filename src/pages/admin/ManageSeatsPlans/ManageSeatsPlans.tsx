import React, { useState } from 'react';
import { Armchair, Calendar, Layers } from 'lucide-react';
import { AdminSeatGrid } from '../../../components/admin/SeatGrid/AdminSeatGrid';
import { PlanTable } from '../../../components/admin/PlanTable/PlanTable';

export const ManageSeatsPlans: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'seats' | 'plans'>('seats');

  return (
    <div className="space-y-6">
      {/* Sub-tab segmented bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('seats')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'seats'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Armchair className="w-4 h-4" />
            <span>A. Manage Seats (Physical Desks)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('plans')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'plans'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>B. Manage Plans (Membership Tiers)</span>
          </button>
        </div>

        <div className="hidden md:flex items-center text-[11px] text-slate-400 pr-3">
          Synchronized with Public Application
        </div>
      </div>

      {/* Render sub-section */}
      {activeSubTab === 'seats' ? <AdminSeatGrid /> : <PlanTable />}
    </div>
  );
};
