import React, { useState, useMemo } from 'react';
import { Seat } from '../../types';
import { useLibrary } from '../../context/LibraryContext';
import { SeatCard } from '../SeatCard/SeatCard';
import { SeatDetailModal } from '../SeatDetailModal/SeatDetailModal';
import { Search, Filter, RefreshCw, AlertCircle, Building2 } from 'lucide-react';

interface SeatGridProps {
  onSelectSeat?: (seat: Seat) => void;
  selectedSeatNumber?: string;
  isCompact?: boolean;
}

export const SeatGrid: React.FC<SeatGridProps> = ({ 
  onSelectSeat, 
  selectedSeatNumber, 
  isCompact = false 
}) => {
  const { seats, floors, stats } = useLibrary();
  
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'occupied'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeModalSeat, setActiveModalSeat] = useState<Seat | null>(null);

  // Filtered seats
  const filteredSeats = useMemo(() => {
    return seats.filter((seat) => {
      // Floor filter
      if (selectedFloor !== 'all') {
        if (selectedFloor === 'unassigned') {
          if (seat.floorId) return false;
        } else if (seat.floorId !== selectedFloor) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && seat.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesNumber = seat.number.toLowerCase().includes(query);
        const matchesOccupant = seat.occupiedBy?.toLowerCase().includes(query);
        if (!matchesNumber && !matchesOccupant) {
          return false;
        }
      }
      return true;
    });
  }, [seats, selectedFloor, statusFilter, searchQuery]);

  const handleSeatClick = (seat: Seat) => {
    if (onSelectSeat) {
      onSelectSeat(seat);
    } else {
      setActiveModalSeat(seat);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Live Availability Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Capacity
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block font-mono">
            {stats.totalSeats}
          </span>
          <span className="text-[11px] text-slate-500">Across study floors</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
            Available Desks
          </span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block font-mono">
            {stats.availableSeats}
          </span>
          <span className="text-[11px] text-emerald-800">Ready to occupy</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
            Occupied Desks
          </span>
          <span className="text-2xl font-bold text-rose-700 mt-1 block font-mono">
            {stats.occupiedSeats}
          </span>
          <span className="text-[11px] text-rose-800">Assigned to members</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
            Maintenance
          </span>
          <span className="text-2xl font-bold text-slate-700 mt-1 block font-mono">
            {stats.maintenanceSeats}
          </span>
          <span className="text-[11px] text-slate-500">Scheduled repairs</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Floor & Status Segmented Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Floor Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <span className="px-2 text-slate-500 text-[11px] font-semibold uppercase flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span>Floor:</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedFloor('all')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedFloor === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Floors
              </button>
              {floors.map((fl) => (
                <button
                  key={fl.id}
                  type="button"
                  onClick={() => setSelectedFloor(fl.id)}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    selectedFloor === fl.id
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {fl.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedFloor('unassigned')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedFloor === 'unassigned'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                No Floor
              </button>
            </div>

            {/* Availability Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              {(['all', 'available', 'occupied'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-md transition-colors capitalize cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'all' ? 'All Desks' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search desk number e.g. A01..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Seat Grid Display */}
      {filteredSeats.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-semibold text-slate-800">No seats matched your filter</h4>
          <p className="text-xs text-slate-500">Try adjusting the floor or search term.</p>
          <button
            onClick={() => {
              setSelectedFloor('all');
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className="text-xs font-medium text-emerald-700 hover:underline pt-2 inline-flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset all filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
          <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
            <span>Showing <strong className="text-slate-800 font-mono">{filteredSeats.length}</strong> seats</span>
            <span>Click any seat to view amenities or reserve</span>
          </div>

          <div className={`grid gap-3 ${
            isCompact
              ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8'
          }`}>
            {filteredSeats.map((seat) => (
              <SeatCard
                key={seat.id}
                seat={seat}
                isSelected={selectedSeatNumber === seat.number}
                onClick={handleSeatClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Interactive Modal */}
      <SeatDetailModal
        seat={activeModalSeat}
        onClose={() => setActiveModalSeat(null)}
      />
    </div>
  );
};
