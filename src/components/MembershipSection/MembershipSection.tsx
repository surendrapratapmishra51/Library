import React from 'react';
import { Link } from 'react-router-dom';
import { mockPlans } from '../../data/mockPlans';
import { MembershipCard } from '../MembershipCard/MembershipCard';
import { ShieldCheck, Check } from 'lucide-react';

interface MembershipSectionProps {
  showTitle?: boolean;
}

export const MembershipSection: React.FC<MembershipSectionProps> = ({ showTitle = true }) => {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {showTitle && (
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase">
              Transparent Physical Seat Plans
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display text-balance">
              Simple, All-Inclusive Membership Pricing
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Zero hidden admission charges. Every plan includes guaranteed individual desk access, full air conditioning, silent Wi-Fi, and 100% electricity backup.
            </p>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockPlans.map((plan) => (
            <MembershipCard key={plan.id} plan={plan} />
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-12 bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Want to inspect the reading hall before enrolling?</p>
              <p className="text-xs text-slate-500">Visit us during daytime hours for a free 2-hour trial sitting experience.</p>
            </div>
          </div>

          <Link
            to="/contact"
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs whitespace-nowrap transition-colors"
          >
            Schedule Free Trial Visit
          </Link>
        </div>

      </div>
    </section>
  );
};
