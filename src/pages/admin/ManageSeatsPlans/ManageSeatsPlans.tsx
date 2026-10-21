import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Armchair, Building2, Calendar, History } from 'lucide-react';
import { AdminSeatGrid } from '../../../components/admin/SeatGrid/AdminSeatGrid';
import { ManageFloors } from '../ManageFloors/ManageFloors';
import { AllocationHistoryTable } from '../../../components/admin/AllocationHistory/AllocationHistoryTable';
import { PlanTable } from '../../../components/admin/PlanTable/PlanTable';

export const ManageSeatsPlans: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as 'seats' | 'floors' | 'history' | 'plans' | null;

  const [activeSubTab, setActiveSubTab] = useState<'seats' | 'floors' | 'history' | 'plans'>(
    initialTab && ['seats', 'floors', 'history', 'plans'].includes(initialTab) ? initialTab : 'seats'
  );

  useEffect(() => {
    const tab = searchParams.get('tab') as any;
    if (tab && ['seats', 'floors', 'history', 'plans'].includes(tab)) {
      setActiveSubTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'seats' | 'floors' | 'history' | 'plans') => {
    setActiveSubTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab segmented bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {/* Seats Tab */}
          <button
            type="button"
            onClick={() => handleTabChange('seats')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'seats'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Armchair className="w-4 h-4" />
            <span>Manage Seats</span>
          </button>

          {/* Floors Tab */}
          <button
            type="button"
            onClick={() => handleTabChange('floors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'floors'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Manage Floors</span>
          </button>

          {/* Allocation History Tab */}
          <button
            type="button"
            onClick={() => handleTabChange('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Allocation History</span>
          </button>

          {/* Membership Plans Tab */}
          <button
            type="button"
            onClick={() => handleTabChange('plans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'plans'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Membership Plans</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center text-[11px] text-slate-400 pr-3 font-medium">
          FocusZone Real-Time Database Synchronized
        </div>
      </div>

      {/* Render selected sub-section */}
      {activeSubTab === 'seats' && <AdminSeatGrid />}
      {activeSubTab === 'floors' && <ManageFloors />}
      {activeSubTab === 'history' && <AllocationHistoryTable />}
      {activeSubTab === 'plans' && <PlanTable />}
    </div>
  );
};
