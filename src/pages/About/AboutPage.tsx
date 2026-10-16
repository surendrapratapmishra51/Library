import React from 'react';
import { ShieldCheck, Target, HeartHandshake, BookOpen, Clock, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase">
          Our Foundation Story
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-display">
          Building the Sanctum of Pure Focus
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          FocusZone was founded with a singular purpose: to give determined competitive exam candidates a peaceful, noise-free, high-comfort sanctuary to study without disruptions.
        </p>
      </div>

      {/* Main Narrative & Philosophy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-5 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-2xl font-bold text-slate-900 font-display">
            Why We Are Not a Public Book Library
          </h2>
          <p>
            Traditional libraries are designed for borrowing and browsing books. However, modern students preparing for competitive examinations (like UPSC Civil Services, CA, NEET-PG, GATE, or State Judiciary) already have their own study syllabus, tablet lectures, and test series.
          </p>
          <p>
            What students desperately lack in crowded cities is a <strong>calm, distraction-free environment</strong>. Distractions at home, frequent electricity cuts during summer, loud traffic horns, and unreliable internet make 8 to 12 hours of deep work almost impossible.
          </p>
          <p>
            FocusZone provides individual private desks where you can sit from early morning to late night with pin-drop silence, steady climate-controlled temperature, continuous power, and fast WiFi.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
              <span className="text-2xl font-black font-display text-emerald-700 block mb-1">100</span>
              <p className="font-semibold text-slate-800">Private Study Carrels</p>
              <p className="text-slate-500 mt-0.5">Dual floors with strict silence</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
              <span className="text-2xl font-black font-display text-emerald-700 block mb-1">24/7</span>
              <p className="font-semibold text-slate-800">Unrestricted Access</p>
              <p className="text-slate-500 mt-0.5">Study according to your natural rhythm</p>
            </div>
          </div>
        </div>

        {/* Visual Architectural Card */}
        <div className="lg:col-span-5 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
          <div className="relative z-10 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <Target className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold font-display text-white">
              Our Core Mission
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              "To eliminate every physical friction point between an ambitious student and their preparation goal—providing pristine air, uninterrupted electricity, zero sound, and ergonomic comfort so success becomes inevitable."
            </p>

            <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Compromise on Silence</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>365 Days Open (Including Holidays)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Respectful Community of Like-Minded Aspirants</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Pillars of Study Space */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 font-display">
            The 3 Pillars of FocusZone
          </h2>
          <p className="text-xs text-slate-500 mt-1">Engineered specifically for peak cognitive performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 font-display text-base mb-2">
              1. Acoustic Isolation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We employ sound-absorbing ceiling acoustic foam tiles and carpeted pathways to dampen footsteps, keyboard clicks, and whispers.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 font-display text-base mb-2">
              2. Fixed Carrel Ownership
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No daily rush to grab a seat. Your desk is 100% reserved in your name, allowing you to settle in and build a sustainable 6-month study cadence.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 font-display text-base mb-2">
              3. Student Well-Being
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clean air circulation, fresh hot and chilled RO water stations, hygienic modern washrooms, and an external break room to refresh your mind.
            </p>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-2xl sm:text-3xl font-bold font-display">
            Experience the Quiet in Person
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-lg">
            Schedule a 2-hour complimentary trial sitting session to feel the focus difference.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/contact"
            className="px-6 py-3 text-xs font-semibold text-emerald-950 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            Schedule Free Visit
          </Link>
          <Link
            to="/seats"
            className="px-6 py-3 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 border border-emerald-600 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            Check Seats
          </Link>
        </div>
      </div>
    </div>
  );
};
