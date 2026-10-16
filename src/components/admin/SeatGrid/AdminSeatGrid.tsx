import React, { useState, useMemo } from 'react';
import { 
  Armchair, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  ArrowRightLeft, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  Sun,
  ShieldAlert
} from 'lucide-react';
import { Seat, AdminUser } from '../../../types';
import { useLibrary } from '../../../context/LibraryContext';
import { Button } from '../../common/Button';
import { SeatModal } from '../SeatForm/SeatModal';
import { ChangeSeatModal } from '../ChangeSeatModal/ChangeSeatModal';
import { ConfirmationModal } from '../ConfirmationModal/ConfirmationModal';

export const AdminSeatGrid: React.FC = () => {
  const { seats, users, stats, removeSeat, updateSeatStatus } = useLibrary();

  // Filters
  const [selectedFloor, setSelectedFloor] = useState<'all' | '1' | '2'>('all');
  const [selectedSection, setSelectedSection] = useState<'all' | 'A' | 'B' | 'C' | 'D'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'occupied' | 'maintenance'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddSeatOpen, setIsAddSeatOpen] = useState(false);
  const [seatToDelete, setSeatToDelete] = useState<Seat | null>(null);
  const [seatChangeUser, setSeatChangeUser] = useState<AdminUser | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active seat selected in grid for quick actions
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  // Filtered seats
  const filteredSeats = useMemo(() => {
    return seats.filter((seat) => {
      if (selectedFloor !== 'all' && seat.floor.toString() !== selectedFloor) {
        return false;
      }
      if (selectedSection !== 'all' && seat.section !== selectedSection) {
        return false;
      }
      if (statusFilter !== 'all' && seat.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNumber = seat.number.toLowerCase().includes(q);
        const matchesOccupant = seat.occupiedBy?.toLowerCase().includes(q);
        if (!matchesNumber && !matchesOccupant) return false;
      }
      return true;
    });
  }, [seats, selectedFloor, selectedSection, statusFilter, searchQuery]);

  // Handler for Remove Seat attempt
  const handleInitiateRemoveSeat = (seat: Seat) => {
    setErrorMessage(null);

    // Business rule: If seat is occupied, do not allow direct removal!
    if (seat.status === 'occupied') {
      const occupant = users.find((u) => u.seat === seat.number && u.status === 'Active');
      setErrorMessage(
        `Cannot remove Seat ${seat.number}. It is currently occupied by ${occupant?.name || seat.occupiedBy || 'an active student'}. Please change or release the student's seat first.`
      );
      return;
    }

    setSeatToDelete(seat);
  };

  const handleConfirmRemoveSeat = () => {
    if (seatToDelete) {
      const res = removeSeat(seatToDelete.number);
      if (!res.success) {
        setErrorMessage(res.message);
      }
      setSeatToDelete(null);
      setSelectedSeat(null);
    }
  };

  // Find occupant user
  const findOccupantUser = (seatNumber: string) => {
    return users.find((u) => u.seat === seatNumber && u.status === 'Active');
  };

  return (
    <div className="space-y-6">
      
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Total Desks
          </span>
          <div className="text-3xl font-extrabold text-slate-900 font-display">
            {stats.totalSeats}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Floors 1 & 2 layout</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
            Available Desks
          </span>
          <div className="text-3xl font-extrabold text-emerald-700 font-display">
            {stats.availableSeats}
          </div>
          <p className="text-[11px] text-emerald-800 mt-1">Ready for assignment</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block mb-1">
            Occupied Desks
          </span>
          <div className="text-3xl font-extrabold text-rose-700 font-display">
            {stats.occupiedSeats}
          </div>
          <p className="text-[11px] text-rose-800 mt-1">Assigned to students</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
            Maintenance
          </span>
          <div className="text-3xl font-extrabold text-slate-700 font-display">
            {stats.maintenanceSeats}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Electrical repair</p>
        </div>
      </div>

      {/* Top Filter and Add Seat Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Visual Seat Layout Management
            </h2>
            <p className="text-xs text-slate-500">
              Select any desk to reassign student, toggle maintenance, or inspect carrel hardware
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddSeatOpen(true)}
            className="self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Seat
          </Button>
        </div>

        {/* Global Error Banner if business rule violated */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filters Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search seat e.g. A01 or Rahul..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            {/* Floor Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg font-medium">
              <span className="px-2 text-slate-400 font-semibold text-[10px] uppercase">Floor:</span>
              {(['all', '1', '2'] as const).map((floor) => (
                <button
                  key={floor}
                  type="button"
                  onClick={() => setSelectedFloor(floor)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    selectedFloor === floor
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {floor === 'all' ? 'All' : `Floor ${floor}`}
                </button>
              ))}
            </div>

            {/* Section Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg font-medium">
              <span className="px-2 text-slate-400 font-semibold text-[10px] uppercase">Sec:</span>
              {(['all', 'A', 'B', 'C', 'D'] as const).map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSelectedSection(sec)}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    selectedSection === sec
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sec === 'all' ? 'All' : sec}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available (🟢)</option>
              <option value="occupied">Occupied (🔴)</option>
              <option value="maintenance">Maintenance (⚙️)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 text-slate-500 self-end md:self-auto font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Occupied
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Maint.
            </span>
          </div>
        </div>
      </div>

      {/* Visual Seat Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
          <span>Showing <strong className="font-mono text-slate-800">{filteredSeats.length}</strong> desks</span>
          <span>Click any desk for options</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredSeats.map((seat) => {
            const occupantUser = findOccupantUser(seat.number);
            const occupantName = occupantUser?.name || seat.occupiedBy;
            const isSelected = selectedSeat?.number === seat.number;

            return (
              <div
                key={seat.id}
                onClick={() => setSelectedSeat(seat)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between h-[96px] ${
                  seat.status === 'available'
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 hover:bg-emerald-100'
                    : seat.status === 'occupied'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950 hover:bg-rose-100/70'
                    : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200/60'
                } ${isSelected ? 'ring-2 ring-emerald-600 shadow-md scale-[1.02]' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm tracking-tight">
                    {seat.number}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      seat.status === 'available'
                        ? 'bg-emerald-500'
                        : seat.status === 'occupied'
                        ? 'bg-rose-500'
                        : 'bg-slate-400'
                    }`}
                  />
                </div>

                {/* Status / Occupant Name */}
                <div className="text-[11px] leading-tight truncate">
                  {seat.status === 'available' && (
                    <span className="text-emerald-700 font-semibold">Available</span>
                  )}
                  {seat.status === 'occupied' && (
                    <div>
                      <span className="text-rose-700 font-semibold block text-[10px]">Occupied</span>
                      <span className="text-slate-800 font-medium truncate block" title={occupantName}>
                        {occupantName || 'Active Student'}
                      </span>
                    </div>
                  )}
                  {seat.status === 'maintenance' && (
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Maintenance
                    </span>
                  )}
                </div>

                {/* Micro info footer */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-black/5">
                  <span className="font-mono">F{seat.floor}·{seat.section}</span>
                  <div className="flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 text-slate-400" />
                    <Sun className="w-2.5 h-2.5 text-slate-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Seat Action Tray */}
      {selectedSeat && (
        <div className="p-5 bg-slate-900 text-white rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-150">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-emerald-400 text-lg">
                Seat {selectedSeat.number}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  selectedSeat.status === 'available'
                    ? 'bg-emerald-500 text-white'
                    : selectedSeat.status === 'occupied'
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-700 text-slate-200'
                }`}
              >
                {selectedSeat.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Floor {selectedSeat.floor} · Section {selectedSeat.section}
              {selectedSeat.status === 'occupied' && (
                <span>
                  {' '}· Assigned to: <strong className="text-white">{findOccupantUser(selectedSeat.number)?.name || selectedSeat.occupiedBy}</strong>
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Action 1: If Occupied -> Change Student Seat */}
            {selectedSeat.status === 'occupied' && (
              <button
                type="button"
                onClick={() => {
                  const occupant = findOccupantUser(selectedSeat.number);
                  if (occupant) {
                    setSeatChangeUser(occupant);
                  } else {
                    alert(`No active user record linked directly with seat ${selectedSeat.number}.`);
                  }
                }}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Change Student Seat</span>
              </button>
            )}

            {/* Action 2: Toggle Maintenance */}
            {selectedSeat.status !== 'occupied' && (
              <button
                type="button"
                onClick={() => {
                  const nextStatus = selectedSeat.status === 'available' ? 'maintenance' : 'available';
                  updateSeatStatus(selectedSeat.id, nextStatus);
                  setSelectedSeat({ ...selectedSeat, status: nextStatus });
                }}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                {selectedSeat.status === 'available' ? 'Mark Maintenance' : 'Mark Available'}
              </button>
            )}

            {/* Action 3: Remove Seat */}
            <button
              type="button"
              onClick={() => handleInitiateRemoveSeat(selectedSeat)}
              className="px-3.5 py-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Seat</span>
            </button>

            {/* Close tray */}
            <button
              type="button"
              onClick={() => setSelectedSeat(null)}
              className="px-2.5 py-2 text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal 1: Add Seat */}
      <SeatModal
        isOpen={isAddSeatOpen}
        onClose={() => setIsAddSeatOpen(false)}
      />

      {/* Modal 2: Change Seat for Occupant */}
      <ChangeSeatModal
        isOpen={seatChangeUser !== null}
        user={seatChangeUser}
        onClose={() => setSeatChangeUser(null)}
      />

      {/* Modal 3: Confirmation for Remove Seat */}
      <ConfirmationModal
        isOpen={seatToDelete !== null}
        title="Remove Seat from Library"
        message={`Are you sure you want to permanently delete Seat ${seatToDelete?.number} (Floor ${seatToDelete?.floor}, Section ${seatToDelete?.section}) from the library floor plan?`}
        confirmLabel="Remove Seat"
        cancelLabel="Keep Seat"
        variant="danger"
        onConfirm={handleConfirmRemoveSeat}
        onClose={() => setSeatToDelete(null)}
      />

    </div>
  );
};
