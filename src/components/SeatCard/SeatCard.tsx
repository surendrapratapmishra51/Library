import React from 'react';
import { Seat } from '../../types';
import { Zap, Sun, ShieldAlert } from 'lucide-react';

interface SeatCardProps {
  seat: Seat;
  isSelected?: boolean;
  onClick: (seat: Seat) => void;
}

export const SeatCard: React.FC<SeatCardProps> = ({ seat, isSelected = false, onClick }) => {
  const isAvailable = seat.status === 'available';
  const isOccupied = seat.status === 'occupied';
  const isMaintenance = seat.status === 'maintenance';

  // Distinct clean visual styling
  const statusStyles = {
    available: 'bg-emerald-50/80 border-emerald-300 text-emerald-950 hover:bg-emerald-100 hover:border-emerald-500 hover:shadow-md cursor-pointer',
    occupied: 'bg-rose-50/60 border-rose-200/90 text-rose-950 opacity-90 cursor-pointer hover:border-rose-300',
    maintenance: 'bg-slate-100 border-slate-300 text-slate-500 opacity-75 cursor-not-allowed'
  };

  const indicatorDot = {
    available: 'bg-emerald-500 ring-2 ring-emerald-200',
    occupied: 'bg-rose-500 ring-2 ring-rose-200',
    maintenance: 'bg-slate-400 ring-2 ring-slate-200'
  };

  return (
    <button
      type="button"
      onClick={() => onClick(seat)}
      disabled={isMaintenance}
      className={`relative p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-[86px] w-full ${statusStyles[seat.status]} ${
        isSelected ? 'ring-2 ring-emerald-600 border-emerald-600 shadow-md' : ''
      }`}
      aria-label={`Seat ${seat.number}, Status: ${seat.status}`}
    >
      {/* Top Row: Seat Number + Status Dot */}
      <div className="flex items-center justify-between w-full">
        <span className="font-mono font-bold text-sm tracking-tight">
          {seat.number}
        </span>
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${indicatorDot[seat.status]}`}
          title={seat.status}
        />
      </div>

      {/* Middle row: Status label */}
      <div className="text-[11px] font-medium leading-none">
        {isAvailable && <span className="text-emerald-700 font-semibold">Available</span>}
        {isOccupied && <span className="text-rose-700">Occupied</span>}
        {isMaintenance && <span className="text-slate-500 flex items-center gap-1"><ShieldAlert className="w-2.5 h-2.5" /> Maint.</span>}
      </div>

      {/* Bottom Row: Micro feature icons */}
      <div className="flex items-center justify-between w-full pt-1 border-t border-black/5 text-[10px] text-slate-500">
        <span className="text-slate-400 font-mono">F{seat.floor}·{seat.section}</span>
        <div className="flex items-center gap-1">
          {seat.hasPowerOutlet && (
            <span title="Power Socket">
              <Zap className="w-2.5 h-2.5 text-slate-500" />
            </span>
          )}
          {seat.hasDeskLamp && (
            <span title="Warm Lamp">
              <Sun className="w-2.5 h-2.5 text-slate-500" />
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
