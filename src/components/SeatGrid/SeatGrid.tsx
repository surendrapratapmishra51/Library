import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { SeatCard } from '../SeatCard/SeatCard';
import { SeatDetailModal } from '../SeatDetailModal/SeatDetailModal';
import { Seat } from '../../types';
import { Search, Filter, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const { seats, stats } = useLibrary();
  
  const [selectedFloor, setSelectedFloor] = useState<'all' | '1' | '2'>('all');
  const [selectedSection, setSelectedSection] = useState<'all' | 'A' | 'B' | 'C' | 'D'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'occupied'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeModalSeat, setActiveModalSeat] = useState<Seat | null>(null);

  // Filtered seats
  const filteredSeats = useMemo(() => {
    return seats.filter((seat) => {
      // Floor filter
      if (selectedFloor !== 'all' && seat.floor.toString() !== selectedFloor) {
        return false;
      }
      // Section filter
      if (selectedSection !== 'all' && seat.section !== selectedSection) {
        return false;
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
  }, [seats, selectedFloor, selectedSection, statusFilter, searchQuery]);

  const handleSeatClick = (seat: Seat) => {
    if (onSelectSeat) {
      onSelectSeat(seat);
    } else {
      setActiveModalSeat(seat);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Stats & Legend */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Metric Counts */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500">Total Seats:</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{stats.totalSeats}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Available:</span>
            <span className="font-bold font-mono text-sm text-emerald-800">{stats.availableSeats}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Occupied:</span>
            <span className="font-bold font-mono text-sm text-rose-800">{stats.occupiedSeats}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Maintenance:</span>
            <span className="font-bold font-mono text-sm">{stats.maintenanceSeats}</span>
          </div>
        </div>

        {/* Legend Guide */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>Green = Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span>Red = Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-400"></span>
            <span>Gray = Maintenance</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Floor & Section Buttons (Segmented Controls) */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Floor Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <span className="px-2 text-slate-500 text-[11px] font-semibold uppercase">Floor:</span>
              {(['all', '1', '2'] as const).map((floor) => (
                <button
                  key={floor}
                  type="button"
                  onClick={() => setSelectedFloor(floor)}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    selectedFloor === floor
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {floor === 'all' ? 'All Floors' : `Floor ${floor}`}
                </button>
              ))}
            </div>

            {/* Section Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <span className="px-2 text-slate-500 text-[11px] font-semibold uppercase">Section:</span>
              {(['all', 'A', 'B', 'C', 'D'] as const).map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSelectedSection(sec)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    selectedSection === sec
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sec === 'all' ? 'All' : `Sec ${sec}`}
                </button>
              ))}
            </div>

            {/* Availability Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              {(['all', 'available', 'occupied'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search seat e.g. A04..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
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
          <p className="text-xs text-slate-500">Try adjusting the floor, section, or search term.</p>
          <button
            onClick={() => {
              setSelectedFloor('all');
              setSelectedSection('all');
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className="text-xs font-medium text-emerald-700 hover:underline pt-2 inline-flex items-center gap-1"
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
