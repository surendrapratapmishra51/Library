import React from 'react';
import { MapPin, Clock, Phone, MessageSquare, ExternalLink, Navigation } from 'lucide-react';

export const LocationSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase">
            Convenient Transit Access
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display text-balance">
            Visit Our Silent Reading Facility
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Located just 2 minutes walk from Metro Gate 3 with ample two-wheeler and bicycle parking.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Contact & Hours Info Card */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display mb-1">
                  FocusZone Study Library
                </h3>
                <p className="text-xs text-slate-500">Physical Reading Hall & Examination Cabinets</p>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Address</h4>
                  <p className="text-sm text-slate-700 mt-0.5 leading-snug">
                    2nd Floor, Apex Commercial Complex, Opp. Central Park, Near Metro Gate 3, Civil Lines
                  </p>
                  <p className="text-xs text-emerald-700 mt-1 font-medium">Landmark: Above City Union Bank</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Operating Schedule</h4>
                  <p className="text-sm text-slate-700 mt-0.5 font-medium">Open 24 Hours / 7 Days a Week</p>
                  <p className="text-xs text-slate-500 mt-0.5">Reception open for visits: 08:00 AM – 09:00 PM</p>
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Direct Enquiries</h4>
                  <p className="text-sm text-slate-700 mt-0.5 font-mono">+91 98765 43210</p>
                  <p className="text-xs text-slate-500">Available 8 AM to 10 PM daily</p>
                </div>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="pt-4 border-t border-slate-200/80 grid grid-cols-2 gap-3">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Us</span>
              </a>
              <a
                href="tel:+919876543210"
                className="py-2.5 px-3 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Phone className="w-4 h-4 text-slate-600" />
                <span>Call Library</span>
              </a>
            </div>
          </div>

          {/* Map Visual Placeholder with interactive landmarks */}
          <div className="lg:col-span-7 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative min-h-[360px] flex flex-col justify-between p-6">
            {/* Visual stylised map grid background */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3 3" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#mapGrid)" />
                {/* Stylized road lines */}
                <path d="M 0 160 Q 250 140 600 220" stroke="#cbd5e1" strokeWidth="18" fill="none" />
                <path d="M 0 160 Q 250 140 600 220" stroke="#f8fafc" strokeWidth="12" fill="none" />
                <path d="M 320 0 L 320 400" stroke="#cbd5e1" strokeWidth="14" fill="none" />
                <path d="M 320 0 L 320 400" stroke="#f8fafc" strokeWidth="10" fill="none" />
              </svg>
            </div>

            {/* Top Bar on Map */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 shadow-xs flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                <span>Metro Station Gate 3: 150m walking distance</span>
              </div>
              <div className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                Free Parking Inside
              </div>
            </div>

            {/* Central Pin */}
            <div className="relative z-10 self-center my-auto flex flex-col items-center animate-bounce duration-1000">
              <div className="bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>FocusZone Study Library (2nd Floor)</span>
              </div>
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-900"></div>
              <div className="w-4 h-1.5 bg-slate-900/30 rounded-full mt-1 blur-[1px]"></div>
            </div>

            {/* Bottom Actions on Map */}
            <div className="relative z-10 bg-white/95 backdrop-blur-xs p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs">
                <p className="font-bold text-slate-900">Civil Lines Central Metro Station</p>
                <p className="text-slate-500">Take Exit Gate 3, cross right next to Metro Plaza</p>
              </div>
              <a
                href="https://maps.google.com/?q=Civil+Lines+Study+Library"
                target="_blank"
                rel="noreferrer"
                className="py-1.5 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
