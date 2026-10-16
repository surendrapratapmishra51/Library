import React from 'react';
import { FacilitySection } from '../../components/FacilitySection/FacilitySection';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export const FacilitiesPage: React.FC = () => {
  return (
    <div className="py-10 space-y-12">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
        <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase">
          Physical Reading Center
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-display">
          Facilities & Study Amenities
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto">
          Explore our soundproofed, temperature-regulated facilities built for uninterrupted focus and maximum productivity.
        </p>
      </div>

      {/* Facilities Grid with full details */}
      <FacilitySection showAll={true} />

      {/* Facility Rules & Standards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs space-y-6">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-900 font-display">
              The FocusZone Code of Conduct
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              To preserve the ultimate study atmosphere for every student, the following library regulations are strictly enforced:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Zero Noise Policy
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mobiles must remain on silent or flight mode. Voice calls and conversations are strictly forbidden inside reading rooms; please use the exterior sound-isolated lobby.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Assigned Desk Ownership
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your booked desk remains solely yours for the duration of your membership. You can safely leave your study materials, stationery, and bookstands on your desk.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Hygiene & Food Guidelines
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Only sealed water bottles and coffee mugs are permitted at individual desks. Meals and heavy snacks must be consumed in the dedicated pantry lounge.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Full compliance verified daily by on-duty floor warden.</span>
            </div>

            <Link
              to="/seats"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-2 transition-colors shadow-xs"
            >
              <span>Check Desk Availability Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
