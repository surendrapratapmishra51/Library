import React from 'react';
import { 
  Armchair, 
  Snowflake, 
  Wifi, 
  Zap, 
  ShieldCheck, 
  Droplet, 
  Sparkles, 
  VolumeX, 
  Check,
  LucideIcon 
} from 'lucide-react';
import { Facility } from '../../types';

interface FacilityCardProps {
  facility: Facility;
  detailed?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  Armchair,
  Snowflake,
  Wifi,
  Zap,
  ShieldCheck,
  Droplet,
  Sparkles,
  VolumeX
};

export const FacilityCard: React.FC<FacilityCardProps> = ({ facility, detailed = false }) => {
  const Icon = iconMap[facility.iconName] || Armchair;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all group">
      <div>
        <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
          <Icon className="w-5 h-5" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 font-display mb-2">
          {facility.title}
        </h3>

        <p className="text-sm text-slate-600 leading-relaxed">
          {facility.shortDesc}
        </p>

        {detailed && facility.detailedDesc && (
          <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
            {facility.detailedDesc}
          </p>
        )}
      </div>

      {detailed && facility.features && facility.features.length > 0 && (
        <ul className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
          {facility.features.map((feat, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
