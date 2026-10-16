import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Wifi, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export const Hero: React.FC = () => {
  const { stats } = useLibrary();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-slate-50 pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Concrete Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Physical Reading Hall · Admission Open for New Batch</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-display text-balance leading-tight">
              Your Focus. <br />
              <span className="text-emerald-700">Your Space.</span> <br />
              Your Success.
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
              FocusZone is a premier physical study library offering individual sound-buffered cubicles, 24/7 chilled air conditioning, pin-drop silence, and dedicated 300 Mbps fiber internet for competitive aspirants.
            </p>

            {/* Value checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Personal reserved wooden desk</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% generator power backup</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Strict zero-noise discipline</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Biometric access & CCTV security</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/join"
                className="px-6 py-3.5 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all hover:shadow flex items-center gap-2 whitespace-nowrap"
              >
                <span>Join Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/plans"
                className="px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm transition-colors whitespace-nowrap"
              >
                View Membership Plans
              </Link>
            </div>

            {/* Live desk availability indicator */}
            <div className="pt-4 flex items-center gap-3 text-xs text-slate-500">
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                {stats.availableSeats} of {stats.totalSeats} Seats Vacant Today
              </span>
              <span>·</span>
              <Link to="/seats" className="text-slate-700 font-medium hover:text-emerald-700 underline">
                Check seat layout & reserve desk
              </Link>
            </div>
          </div>

          {/* Right Column: Architectural Study Desk Illustration & Preview */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Visual Card representing physical study carrel */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
                
                {/* Visual Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Carrel Desk Architecture
                    </h3>
                    <p className="text-xs text-slate-500">Standard Individual Cubicle Specification</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700">
                    Floor 1 & 2
                  </span>
                </div>

                {/* Desk Illustration Graphic */}
                <div className="relative bg-slate-900 rounded-xl p-5 text-white overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="flex items-center justify-between text-xs text-slate-300 mb-3">
                    <span className="font-mono text-emerald-400">DESK #A04 · PRIVATE CARREL</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Active Status
                    </span>
                  </div>

                  {/* SVG Isometric Study Carrel representation */}
                  <div className="py-2 flex justify-center">
                    <svg
                      viewBox="0 0 280 140"
                      className="w-full max-w-[260px] h-auto drop-shadow-md text-emerald-400"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Back acoustic partition wall */}
                      <rect x="20" y="20" width="240" height="75" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                      {/* Left and right side partition wings */}
                      <path d="M20 20 L2 45 L2 110 L20 95 Z" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                      <path d="M260 20 L278 45 L278 110 L260 95 Z" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                      {/* Desk surface */}
                      <polygon points="2,110 278,110 260,90 20,90" fill="#334155" stroke="#475569" strokeWidth="2" />
                      
                      {/* Personal Study Lamp with Warm Glow */}
                      <path d="M45 90 L45 45 L75 45" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                      <polygon points="70,42 85,42 90,52 65,52" fill="#10b981" />
                      <polygon points="65,52 90,52 115,88 40,88" fill="url(#warmGlow)" opacity="0.6" />
                      
                      {/* Power Socket strip */}
                      <rect x="200" y="70" width="36" height="15" rx="3" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
                      <circle cx="208" cy="77" r="2.5" fill="#64748b" />
                      <circle cx="218" cy="77" r="2.5" fill="#64748b" />
                      <circle cx="228" cy="77" r="2.5" fill="#10b981" />
                      
                      {/* Book Stand & Study Notes on Desk */}
                      <rect x="110" y="75" width="48" height="28" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
                      <path d="M120 83 L150 83 M120 88 L145 88 M120 93 L138 93" stroke="#cbd5e1" strokeWidth="1" />

                      {/* Ergonomic chair back preview */}
                      <path d="M115 112 Q140 106 165 112 L160 138 L120 138 Z" fill="#047857" stroke="#10b981" strokeWidth="1.5" />
                      
                      <defs>
                        <linearGradient id="warmGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#fef08a" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-300 border-t border-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                      Dedicated Bandwidth
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      Quiet Hours: 24/7
                    </span>
                  </div>
                </div>

                {/* Desk Features Checklist */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="font-semibold text-slate-900">3.5 Ft Solid Desk</p>
                    <p className="text-slate-500">Wide enough for books & laptop</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="font-semibold text-slate-900">Acoustic Foam Walls</p>
                    <p className="text-slate-500">Absorbs typing & movement sound</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="font-semibold text-slate-900">Dual 3-Pin Sockets</p>
                    <p className="text-slate-500">Laptop + mobile charging</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="font-semibold text-slate-900">Mesh Lumbar Chair</p>
                    <p className="text-slate-500">Designed for 10+ hr sitting</p>
                  </div>
                </div>

                <div className="pt-1">
                  <Link
                    to="/seats"
                    className="w-full py-2.5 px-4 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Explore All 100 Live Desks Across 2 Floors</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
