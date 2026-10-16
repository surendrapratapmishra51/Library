import React from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../../components/Hero/Hero';
import { StatsSection } from '../../components/Stats/StatsSection';
import { FacilitySection } from '../../components/FacilitySection/FacilitySection';
import { MembershipSection } from '../../components/MembershipSection/MembershipSection';
import { WhyChooseUs } from '../../components/WhyChooseUs/WhyChooseUs';
import { LocationSection } from '../../components/LocationSection/LocationSection';
import { TestimonialCard } from '../../components/TestimonialCard/TestimonialCard';
import { mockTestimonials } from '../../data/mockTestimonials';
import { useLibrary } from '../../context/LibraryContext';
import { ArrowRight, CheckCircle2, Armchair } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { seats, stats } = useLibrary();

  // Representative sample of 12 seats for the home preview
  const previewSeats = seats.slice(0, 16);

  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Quick Stats */}
      <StatsSection />

      {/* 3. Facilities Section */}
      <FacilitySection limit={8} />

      {/* 4. Live Seat Availability Preview */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
                  Real-Time Desk Allocation
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
                  Seat Availability Preview
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
                  Know exactly which cubicles are open before stepping in. Reserved personal desks guarantee your fixed study carrel is never occupied by anyone else.
                </p>

                {/* Quick breakdown metrics */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 text-center">
                    <p className="text-xs text-slate-400">Total Seats</p>
                    <p className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                      {stats.totalSeats}
                    </p>
                  </div>
                  <div className="bg-emerald-950/60 border border-emerald-800/60 rounded-xl p-3.5 text-center">
                    <p className="text-xs text-emerald-300">Available</p>
                    <p className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                      {stats.availableSeats}
                    </p>
                  </div>
                  <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-3.5 text-center">
                    <p className="text-xs text-rose-300">Occupied</p>
                    <p className="text-2xl font-bold font-mono text-rose-300 mt-1 tabular-nums">
                      {stats.occupiedSeats}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <Link
                    to="/seats"
                    className="px-6 py-3 text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                  >
                    <span>View All 100 Seats & Layout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/join"
                    className="px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                  >
                    Instant Seat Reservation
                  </Link>
                </div>
              </div>

              {/* Mini visual seat matrix */}
              <div className="lg:col-span-6 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800 text-xs text-slate-400">
                  <span className="font-mono text-slate-300">SECTION A · LIVE SEAT SAMPLE</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Open
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span> Taken
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2.5">
                  {previewSeats.map((seat) => (
                    <div
                      key={seat.id}
                      className={`p-2.5 rounded-lg border text-center transition-transform hover:scale-105 ${
                        seat.status === 'available'
                          ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
                          : seat.status === 'occupied'
                          ? 'bg-slate-900 border-slate-800 text-slate-500'
                          : 'bg-slate-900 border-slate-800 text-slate-600'
                      }`}
                    >
                      <span className="font-mono font-bold text-xs">{seat.number}</span>
                      <div className="text-[10px] mt-0.5 opacity-80">
                        {seat.status === 'available' ? '🟢 Open' : '🔴 Taken'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Floor 1 & 2 Floorplans</span>
                  <Link to="/seats" className="text-emerald-400 hover:underline">
                    Explore full floor matrix →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Membership Plans Preview */}
      <MembershipSection />

      {/* 6. Why Choose Us */}
      <WhyChooseUs />

      {/* 7. Testimonials */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase">
              Proven Study Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display text-balance">
              Student Experiences & Testimonials
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Hear directly from candidates preparing for UPSC, State PCS, CA, and Medical exams in our quiet cabinets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockTestimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      {/* 8. Location & Visiting Hours */}
      <LocationSection />
    </div>
  );
};
