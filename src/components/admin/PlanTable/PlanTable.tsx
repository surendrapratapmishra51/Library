import React, { useState } from 'react';
import { Plus, Edit2, Power, CheckCircle2, AlertCircle, Calendar, ShieldCheck } from 'lucide-react';
import { MembershipPlan } from '../../../types';
import { useLibrary } from '../../../context/LibraryContext';
import { Button } from '../../common/Button';
import { PlanModal } from '../PlanForm/PlanModal';

export const PlanTable: React.FC = () => {
  const { plans, users, togglePlanStatus } = useLibrary();
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<MembershipPlan | null>(null);

  // Count active members per plan
  const getPlanMemberCount = (planId: string, planName: string) => {
    return users.filter(
      (u) => (u.planId === planId || u.plan === planName) && u.status === 'Active'
    ).length;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-display">
            Study Library Membership Packages
          </h2>
          <p className="text-xs text-slate-500">
            Define seat subscription tiers, durations, and pricing
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddPlanOpen(true)}
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Plan
        </Button>
      </div>

      {/* Business Rule Information Banner */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 block mb-0.5">Plan Governance & History Rule</strong>
          Setting a plan to <strong>Inactive</strong> disables it from being selected for new candidate admissions. Existing students previously enrolled under that plan retain their historical data, seat reservation, and billing rate.
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="p-4 font-semibold">Plan Name</th>
                <th className="p-4 font-semibold">Duration</th>
                <th className="p-4 font-semibold">Price (₹)</th>
                <th className="p-4 font-semibold">Active Enrollees</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {plans.map((plan) => {
                const enrollees = getPlanMemberCount(plan.id, plan.name);
                const isActive = plan.status === 'Active';

                return (
                  <tr key={plan.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{plan.name}</span>
                        {plan.isPopular && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                            Popular
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-medium text-slate-800">
                      {plan.duration}
                    </td>
                    <td className="p-4 font-bold font-mono text-slate-900 text-sm">
                      ₹{plan.price.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {enrollees} students
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {plan.status}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs text-slate-500 truncate" title={plan.description}>
                      {plan.description || 'Full 24/7 or 14-hr seat access'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Plan */}
                        <button
                          type="button"
                          onClick={() => setPlanToEdit(plan)}
                          className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        {/* Toggle Status (Active / Inactive) */}
                        <button
                          type="button"
                          onClick={() => togglePlanStatus(plan.id)}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                            isActive
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{isActive ? 'Disable' : 'Enable'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Plan Modal */}
      <PlanModal
        isOpen={isAddPlanOpen || planToEdit !== null}
        planToEdit={planToEdit}
        onClose={() => {
          setIsAddPlanOpen(false);
          setPlanToEdit(null);
        }}
      />

    </div>
  );
};
