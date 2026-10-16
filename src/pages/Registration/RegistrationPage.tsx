import React from 'react';
import { RegistrationForm } from '../../components/RegistrationForm/RegistrationForm';
import { ShieldCheck, Clock, CheckCircle2, Phone } from 'lucide-react';

export const RegistrationPage: React.FC = () => {
  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase">
          New Aspirant Enrollment
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
          Join FocusZone Study Library
        </h1>
        <p className="text-sm text-slate-600">
          Reserve your personal silent study desk in minutes. Once approved, your Biometric RFID Pass will be issued at the reception.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Registration Form */}
        <div className="lg:col-span-8">
          <RegistrationForm />
        </div>

        {/* Right Side: What happens next & perks */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wider">
              Admission Process in 3 Steps
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-slate-900">Submit Application</strong>
                  <p className="text-slate-500 mt-0.5">Fill out your profile and choose your preferred study carrel desk.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-slate-900">Biometric Verification</strong>
                  <p className="text-slate-500 mt-0.5">Visit the reception once to scan your fingerprint for RFID turnstile access.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-slate-900">Start Your Focus Journey</strong>
                  <p className="text-slate-500 mt-0.5">Occupy your reserved seat and study 24/7 in total peace.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Need help assistance card */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 text-xs text-emerald-950 space-y-3">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>Have Questions Before Joining?</span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              Our floor manager is available 8:00 AM to 10:00 PM to help you with shift timings, locker allocation, or fee payments.
            </p>
            <div className="pt-1">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 hover:text-emerald-900 underline"
              >
                Chat on WhatsApp (+91 98765 43210) →
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
