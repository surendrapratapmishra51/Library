import React from 'react';
import { Armchair, CheckCircle2, Clock, Wifi } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export const StatsSection: React.FC = () => {
  const { stats } = useLibrary();

  const statItems = [
    {
      label: 'Total Reserved Desks',
      value: `${stats.totalSeats}`,
      subtitle: 'Across Floor 1 & Floor 2',
      icon: Armchair,
      accent: 'text-slate-900',
      bgIcon: 'bg-slate-100 text-slate-700'
    },
    {
      label: 'Seats Available Today',
      value: `${stats.availableSeats}`,
      subtitle: 'Instant allocation on registration',
      icon: CheckCircle2,
      accent: 'text-emerald-700',
      bgIcon: 'bg-emerald-50 text-emerald-600'
    },
    {
      label: 'Study Environment',
      value: '24/7',
      subtitle: 'Round-the-clock silent access',
      icon: Clock,
      accent: 'text-slate-900',
      bgIcon: 'bg-blue-50 text-blue-600'
    },
    {
      label: 'High-Speed Fiber',
      value: '300 Mbps',
      subtitle: 'Dual redundant optical lines',
      icon: Wifi,
      accent: 'text-slate-900',
      bgIcon: 'bg-amber-50 text-amber-600'
    }
  ];

  return (
    <section className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="p-6 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all hover:shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {item.label}
                  </span>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.bgIcon}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <div className={`text-3xl font-extrabold font-display tabular-nums tracking-tight ${item.accent}`}>
                    {item.value}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-normal">
                    {item.subtitle}
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
