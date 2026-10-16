import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { mockFacilities } from '../../data/mockFacilities';
import { FacilityCard } from '../FacilityCard/FacilityCard';

interface FacilitySectionProps {
  showAll?: boolean;
  limit?: number;
}

export const FacilitySection: React.FC<FacilitySectionProps> = ({ showAll = false, limit = 8 }) => {
  const displayFacilities = showAll ? mockFacilities : mockFacilities.slice(0, limit);

  return (
    <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase">
              Engineered For Exam Concentration
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display mt-1 text-balance">
              World-Class Infrastructure for Serious Aspirants
            </h2>
            <p className="text-base text-slate-600 mt-2">
              Every detail in our reading hall is built to eliminate distractions: clean air, silent cubicles, and zero electricity interruption.
            </p>
          </div>

          {!showAll && (
            <Link
              to="/facilities"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors shrink-0 group"
            >
              <span>Explore All Specifications</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayFacilities.map((facility) => (
            <FacilityCard key={facility.id} facility={facility} detailed={showAll} />
          ))}
        </div>

      </div>
    </section>
  );
};
