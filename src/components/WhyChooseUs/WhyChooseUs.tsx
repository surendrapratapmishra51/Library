import React from 'react';
import { VolumeX, Armchair, Zap, ShieldCheck } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const benefits = [
    {
      icon: VolumeX,
      title: 'Guaranteed Pin-Drop Silence',
      description: 'Unlike crowded public libraries or homes, we maintain strict whisper-free discipline. Phone calls and group discussions are strictly segregated outside the reading hall.'
    },
    {
      icon: Armchair,
      title: 'Built for 10+ Hour Study Shifts',
      description: 'Comfort is the backbone of rank preparation. Our chairs feature contoured lumbar mesh support, and each solid wood carrel gives 3.5 feet of wide private working surface.'
    },
    {
      icon: Zap,
      title: 'Zero Power Interruptions',
      description: 'Summer heatwaves and power grid cuts will never ruin your mock tests. Instant online generator switches automatically in milliseconds without restarting laptops or routers.'
    },
    {
      icon: ShieldCheck,
      title: '24/7 Biometric Security & Cleanliness',
      description: 'Your notes and books stay safe in your reserved desk. RFID turnstile gates restrict entry strictly to active members, backed by 32 HD security cameras and sanitized premises.'
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase">
            Aspirant-First Standard
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display text-balance">
            Why Hundreds of Students Choose FocusZone
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            A dedicated study room designed from the ground up for UPSC, CA, NEET, Banking, and State PSC aspirants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="bg-white p-7 rounded-xl border border-slate-200 shadow-xs flex items-start gap-4 hover:border-slate-300 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display mb-2">
                    {b.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
