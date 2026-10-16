import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { MembershipPlan } from '../../types';

interface MembershipCardProps {
  plan: MembershipPlan;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({ plan }) => {
  return (
    <div
      className={`relative rounded-2xl p-7 flex flex-col justify-between transition-all ${
        plan.isPopular
          ? 'bg-white border-2 border-emerald-600 shadow-xl shadow-emerald-900/5'
          : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Popular / Recommended Badge */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs ${
              plan.isPopular
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {plan.badge}
          </span>
        </div>
      )}

      <div>
        {/* Plan Title & Timing */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900 font-display">
            {plan.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1">{plan.timing}</p>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-slate-100">
          <span className="text-4xl font-extrabold text-slate-900 font-display tabular-nums">
            ₹{plan.price.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">{plan.billingCycle}</span>
          {plan.originalPrice && (
            <span className="text-xs text-slate-400 line-through tabular-nums ml-auto">
              ₹{plan.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Features list */}
        <ul className="space-y-3 mb-8 text-sm text-slate-700">
          {plan.features?.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className="text-xs leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action CTA */}
      <Link
        to={`/join?plan=${plan.id}`}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-xs tracking-wide uppercase transition-colors flex items-center justify-center gap-2 ${
          plan.isPopular
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
            : 'bg-slate-900 hover:bg-slate-800 text-white'
        }`}
      >
        <span>Enroll With {plan.name}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};
