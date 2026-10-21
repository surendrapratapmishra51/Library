import React, { useState, useMemo } from 'react';
import { 
  Armchair, 
  Search, 
  Filter, 
  Plus, 
  Layers, 
  Trash2, 
  ArrowRightLeft, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  Sun,
  ShieldAlert,
  Building2,
  Undo2,
  LayoutGrid,
  List
} from 'lucide-react';
import { Seat, AdminUser } from '../../../types';
import { useLibrary } from '../../../context/LibraryContext';
import { Button } from '../../common/Button';
import { SeatModal } from '../SeatForm/SeatModal';
import { BulkSeatModal } from '../BulkSeatModal/BulkSeatModal';
import { ChangeSeatModal } from '../ChangeSeatModal/ChangeSeatModal';
import { ConfirmationModal } from '../ConfirmationModal/ConfirmationModal';

export const AdminSeatGrid: React.FC = () => {
  const { seats, floors, users, stats, removeSeat, updateSeatStatus, releaseSeat } = useLibrary();

  // Filters & Views
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'occupied' | 'maintenance'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddSeatOpen, setIsAddSeatOpen] = useState(false);
  const [isBulkSeatOpen, setIsBulkSeatOpen] = useState(false);
  const [seatToDelete, setSeatToDelete] = useState<Seat | null>(null);
  const [seatToRelease, setSeatToRelease] = useState<Seat | null>(null);
  const [seatChangeUser, setSeatChangeUser] = useState<AdminUser | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Active seat selected in grid for quick actions
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

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
        const q = searchQuery.toLowerCase().trim();
        const matchesNumber = seat.number.toLowerCase().includes(q);
        const matchesOccupant = seat.occupiedBy?.toLowerCase().includes(q);
        if (!matchesNumber && !matchesOccupant) return false;
      }
      return true;
    });
  }, [seats, selectedFloor, statusFilter, searchQuery]);

  // Handler for Remove Seat attempt
  const handleInitiateRemoveSeat = (seat: Seat) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Business rule: If seat is occupied, do not allow direct removal!
    if (seat.status === 'occupied' || (seat.occupiedBy && seat.occupiedBy.trim())) {
      const occupant = users.find((u) => u.seat === seat.number && u.status === 'Active');
      setErrorMessage(
        `Cannot remove Seat ${seat.number}. It is currently occupied by ${occupant?.name || seat.occupiedBy || 'an active member'}. Please transfer or release the member first.`
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
      } else {
        setSuccessMessage(`Seat ${seatToDelete.number} was successfully deleted.`);
      }
      setSeatToDelete(null);
      setSelectedSeat(null);
    }
  };

  // Handler for explicit seat release
  const handleInitiateReleaseSeat = (seat: Seat) => {
    setSeatToRelease(seat);
  };

  const handleConfirmReleaseSeat = async () => {
    if (!seatToRelease) return;
    try {
      const occupant = users.find((u) => u.seat === seatToRelease.number && u.status === 'Active');
      const res = await releaseSeat({ userId: occupant?.id, seatNumber: seatToRelease.number });
      if (res.success) {
        setSuccessMessage(`Seat ${seatToRelease.number} released successfully.`);
        if (selectedSeat?.number === seatToRelease.number) {
          setSelectedSeat({ ...selectedSeat, status: 'available', occupiedBy: null, assignedUntil: null });
        }
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to release seat.');
    } finally {
      setSeatToRelease(null);
    }
  };

  // Handler for status toggle (Maintenance vs Available)
  const handleToggleMaintenance = (seat: Seat) => {
    setErrorMessage(null);
    setWarningMessage(null);

    if (seat.status === 'occupied') {
      setWarningMessage(
        `Seat ${seat.number} marked as Maintenance. Member allocation for ${seat.occupiedBy || 'active student'} is preserved.`
      );
      updateSeatStatus(seat.id, 'maintenance', seat.occupiedBy || undefined);
      setSelectedSeat({ ...seat, status: 'maintenance' });
      return;
    }

    const nextStatus = seat.status === 'available' ? 'maintenance' : 'available';
    updateSeatStatus(seat.id, nextStatus);
    setSelectedSeat({ ...seat, status: nextStatus });
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
          <p className="text-[11px] text-slate-500 mt-1">Across all library locations</p>
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
          <p className="text-[11px] text-rose-800 mt-1">Assigned to members</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
            Unavailable Desks
          </span>
          <div className="text-3xl font-extrabold text-slate-700 font-display">
            {stats.maintenanceSeats}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Maintenance / Blocked</p>
        </div>
      </div>

      {/* Top Filter and Add Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Desk Layout & Allocation Control
            </h2>
            <p className="text-xs text-slate-500">
              Select any desk to transfer member, release allocation, toggle maintenance, or inspect carrel hardware
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsBulkSeatOpen(true)}
              className="cursor-pointer"
            >
              <Layers className="w-4 h-4 mr-2 text-emerald-600" />
              Bulk Add Desks
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => setIsAddSeatOpen(true)}
              className="cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Single Desk
            </Button>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-900 font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Global Warning Banner */}
        {warningMessage && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{warningMessage}</span>
            </div>
            <button
              onClick={() => setWarningMessage(null)}
              className="text-amber-600 hover:text-amber-900 font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Global Success Banner */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-900 font-bold p-1 cursor-pointer"
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
                placeholder="Search seat e.g. A01 or Aman..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
              />
            </div>

            {/* Floor Filter (Segmented or Dropdown) */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg font-medium">
              <span className="px-2 text-slate-400 font-semibold text-[10px] uppercase">Floor:</span>
              <button
                type="button"
                onClick={() => setSelectedFloor('all')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedFloor === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              {floors.map((fl) => (
                <button
                  key={fl.id}
                  type="button"
                  onClick={() => setSelectedFloor(fl.id)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
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
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedFloor === 'unassigned'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                No Floor
              </button>
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
              <option value="maintenance">Unavailable / Maint. (⚙️)</option>
            </select>
          </div>

          {/* Right Layout View Switcher & Legend */}
          <div className="flex items-center gap-4 self-end md:self-auto font-medium">
            <div className="hidden lg:flex items-center gap-3 text-slate-500 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Occupied
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Unavailable
              </span>
            </div>

            {/* View Mode Buttons */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid Matrix View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Detailed Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Grid or Table View */}
      {viewMode === 'grid' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
            <span>Showing <strong className="font-mono text-slate-800">{filteredSeats.length}</strong> desks</span>
            <span>Click any desk for options</span>
          </div>

          {filteredSeats.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Armchair className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-700">No Desks Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try adjusting your floor or status filter, or click "Add Single Desk" to add one.
              </p>
            </div>
          ) : (
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
                          <span className="text-slate-800 font-medium truncate block" title={occupantName || ''}>
                            {occupantName || 'Active Member'}
                          </span>
                        </div>
                      )}
                      {seat.status === 'maintenance' && (
                        <span className="text-slate-500 font-medium flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Unavailable
                        </span>
                      )}
                    </div>

                    {/* Floor Label without Section */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-black/5">
                      <span className="truncate max-w-[85px] font-medium" title={seat.floorName || 'No Floor'}>
                        {seat.floorName || (seat.floor ? `Floor ${seat.floor}` : 'No Floor')}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <Zap className="w-2.5 h-2.5 text-slate-400" />
                        <Sun className="w-2.5 h-2.5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Desk Number</th>
                  <th className="py-3 px-4">Floor Location</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Assigned Member</th>
                  <th className="py-3 px-4">Allocation Expiry</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSeats.map((seat) => {
                  const occupantUser = findOccupantUser(seat.number);
                  const occupantName = occupantUser?.name || seat.occupiedBy;

                  return (
                    <tr key={seat.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                        {seat.number}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{seat.floorName || (seat.floor ? `Floor ${seat.floor}` : 'No Floor')}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            seat.status === 'available'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : seat.status === 'occupied'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              seat.status === 'available'
                                ? 'bg-emerald-500'
                                : seat.status === 'occupied'
                                ? 'bg-rose-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          {seat.status}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {occupantName ? (
                          <span className="font-bold text-slate-900">
                            {occupantName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600">
                        {seat.assignedUntil || <span className="text-slate-400">-</span>}
                      </td>

                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={seat.description || ''}>
                        {seat.description || <span className="text-slate-400 italic">Standard desk</span>}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* If Occupied -> Transfer Seat */}
                          {seat.status === 'occupied' && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  const occupant = findOccupantUser(seat.number);
                                  if (occupant) {
                                    setSeatChangeUser(occupant);
                                  } else {
                                    alert(`No active user record linked directly with seat ${seat.number}.`);
                                  }
                                }}
                                title="Transfer Student Seat"
                                className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <ArrowRightLeft className="w-3 h-3" />
                                <span>Transfer</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleInitiateReleaseSeat(seat)}
                                title="Release Seat Allocation"
                                className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Undo2 className="w-3 h-3" />
                                <span>Release</span>
                              </button>
                            </>
                          )}

                          {/* Toggle Maintenance */}
                          <button
                            type="button"
                            onClick={() => handleToggleMaintenance(seat)}
                            title={seat.status === 'maintenance' ? 'Mark Available' : 'Mark Unavailable'}
                            className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>

                          {/* Remove Seat */}
                          <button
                            type="button"
                            onClick={() => handleInitiateRemoveSeat(seat)}
                            title="Delete Seat"
                            className="p-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Seat Action Tray (in Grid View) */}
      {selectedSeat && viewMode === 'grid' && (
        <div className="p-5 bg-slate-900 text-white rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-150">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-emerald-400 text-lg">
                Desk {selectedSeat.number}
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
              Location: <strong>{selectedSeat.floorName || (selectedSeat.floor ? `Floor ${selectedSeat.floor}` : 'No Floor')}</strong>
              {selectedSeat.status === 'occupied' && (
                <span>
                  {' '}· Assigned to: <strong className="text-white">{findOccupantUser(selectedSeat.number)?.name || selectedSeat.occupiedBy}</strong>
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Action 1: If Occupied -> Transfer Seat */}
            {selectedSeat.status === 'occupied' && (
              <>
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
                  <span>Transfer Member Seat</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInitiateReleaseSeat(selectedSeat)}
                  className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Release Seat</span>
                </button>
              </>
            )}

            {/* Action 2: Toggle Maintenance */}
            <button
              type="button"
              onClick={() => handleToggleMaintenance(selectedSeat)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              {selectedSeat.status === 'maintenance' ? 'Mark Available' : 'Mark Unavailable / Maint.'}
            </button>

            {/* Action 3: Remove Seat */}
            <button
              type="button"
              onClick={() => handleInitiateRemoveSeat(selectedSeat)}
              className="px-3.5 py-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Desk</span>
            </button>

            {/* Close tray */}
            <button
              type="button"
              onClick={() => setSelectedSeat(null)}
              className="px-2.5 py-2 text-slate-400 hover:text-white cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal 1: Add Single Seat */}
      <SeatModal
        isOpen={isAddSeatOpen}
        onClose={() => setIsAddSeatOpen(false)}
      />

      {/* Modal 2: Bulk Add Seats */}
      <BulkSeatModal
        isOpen={isBulkSeatOpen}
        onClose={() => setIsBulkSeatOpen(false)}
      />

      {/* Modal 3: Change/Transfer Seat for Occupant */}
      <ChangeSeatModal
        isOpen={seatChangeUser !== null}
        user={seatChangeUser}
        onClose={() => setSeatChangeUser(null)}
      />

      {/* Modal 4: Confirmation for Remove Seat */}
      <ConfirmationModal
        isOpen={seatToDelete !== null}
        title="Remove Seat from Library"
        message={`Are you sure you want to permanently delete Seat ${seatToDelete?.number} (${seatToDelete?.floorName || 'No Floor'}) from the library floor plan?`}
        confirmLabel="Remove Seat"
        cancelLabel="Keep Seat"
        variant="danger"
        onConfirm={handleConfirmRemoveSeat}
        onClose={() => setSeatToDelete(null)}
      />

      {/* Modal 5: Confirmation for Explicit Seat Release */}
      <ConfirmationModal
        isOpen={seatToRelease !== null}
        title="Release Seat Allocation"
        message={`Are you sure you want to release Seat ${seatToRelease?.number} from its current member? The desk will become immediately available for other members, and the allocation will be marked as Released in history.`}
        confirmLabel="Release Seat"
        cancelLabel="Keep Allocation"
        variant="warning"
        onConfirm={handleConfirmReleaseSeat}
        onClose={() => setSeatToRelease(null)}
      />
    </div>
  );
};
