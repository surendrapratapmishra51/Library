import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Power, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Armchair,
  Layers
} from 'lucide-react';
import { Floor } from '../../../types';
import { useLibrary } from '../../../context/LibraryContext';
import { Button } from '../../../components/common/Button';
import { FloorModal } from '../../../components/admin/FloorForm/FloorModal';
import { ConfirmationModal } from '../../../components/admin/ConfirmationModal/ConfirmationModal';

export const ManageFloors: React.FC = () => {
  const { floors, deleteFloor, toggleFloorStatus } = useLibrary();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');

  // Modals state
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [selectedFloorToEdit, setSelectedFloorToEdit] = useState<Floor | null>(null);
  const [floorToDelete, setFloorToDelete] = useState<Floor | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filtered floors
  const filteredFloors = useMemo(() => {
    return floors.filter((f) => {
      if (statusFilter !== 'all' && f.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesDesc = f.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [floors, statusFilter, searchQuery]);

  // Aggregate stats across floors
  const stats = useMemo(() => {
    const totalFloors = floors.length;
    const activeFloors = floors.filter((f) => f.status === 'Active').length;
    const inactiveFloors = floors.filter((f) => f.status === 'Inactive').length;
    const totalFloorSeats = floors.reduce((acc, f) => acc + (f.stats?.totalSeats || 0), 0);
    const availableFloorSeats = floors.reduce((acc, f) => acc + (f.stats?.availableSeats || 0), 0);
    const occupiedFloorSeats = floors.reduce((acc, f) => acc + (f.stats?.occupiedSeats || 0), 0);
    const unavailableFloorSeats = floors.reduce((acc, f) => acc + (f.stats?.unavailableSeats || 0), 0);

    return {
      totalFloors,
      activeFloors,
      inactiveFloors,
      totalFloorSeats,
      availableFloorSeats,
      occupiedFloorSeats,
      unavailableFloorSeats
    };
  }, [floors]);

  // Handle initiate delete
  const handleInitiateDelete = (floor: Floor) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Business check: If floor has seats, warn administrator and prefer deactivation
    if (floor.stats?.totalSeats > 0) {
      setErrorMessage(
        `Cannot delete "${floor.name}" because it currently contains ${floor.stats.totalSeats} desk(s). Please deactivate the floor or remove its seats first to prevent data loss.`
      );
      return;
    }

    setFloorToDelete(floor);
  };

  const handleConfirmDelete = async () => {
    if (!floorToDelete) return;
    try {
      const res = await deleteFloor(floorToDelete.id);
      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        setSuccessMessage(`Floor "${floorToDelete.name}" successfully removed.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove floor.');
    } finally {
      setFloorToDelete(null);
    }
  };

  const handleToggleStatus = async (floor: Floor) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await toggleFloorStatus(floor.id);
      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        const nextState = floor.status === 'Active' ? 'Deactivated' : 'Activated';
        setSuccessMessage(`Floor "${floor.name}" has been ${nextState}.${res.warning ? ` Note: ${res.warning}` : ''}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update floor status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 font-display">
              Floor Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organize study floors, inspect seat occupancy breakdowns, and control floor activation status
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setSelectedFloorToEdit(null);
            setIsFloorModalOpen(true);
          }}
          className="self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Floor
        </Button>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center justify-between gap-3 animate-in fade-in">
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

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center justify-between gap-3 animate-in fade-in">
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

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Total Floors
          </span>
          <div className="text-3xl font-extrabold text-slate-900 font-display">
            {stats.totalFloors}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{stats.activeFloors} Active · {stats.inactiveFloors} Inactive</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
            Available Desks
          </span>
          <div className="text-3xl font-extrabold text-emerald-700 font-display">
            {stats.availableFloorSeats}
          </div>
          <p className="text-[11px] text-emerald-800 mt-1">Open for assignment</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block mb-1">
            Occupied Desks
          </span>
          <div className="text-3xl font-extrabold text-rose-700 font-display">
            {stats.occupiedFloorSeats}
          </div>
          <p className="text-[11px] text-rose-800 mt-1">Currently assigned</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
            Unavailable Desks
          </span>
          <div className="text-3xl font-extrabold text-slate-700 font-display">
            {stats.unavailableFloorSeats}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Maintenance / Blocked</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search floors by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg font-medium">
            <span className="px-2 text-slate-400 font-semibold text-[10px] uppercase">Status:</span>
            {(['all', 'Active', 'Inactive'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium self-end sm:self-auto">
          Showing <strong className="text-slate-900 font-mono">{filteredFloors.length}</strong> of {floors.length} floors
        </div>
      </div>

      {/* Floors Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredFloors.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-700">No Floors Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or status filter.'
                : 'No physical floors have been configured. Click "Add New Floor" above to create one.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Floor Level</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Total Desks</th>
                  <th className="py-3 px-4 text-center">Available</th>
                  <th className="py-3 px-4 text-center">Occupied</th>
                  <th className="py-3 px-4 text-center">Unavailable</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredFloors.map((floor) => {
                  const fStats = floor.stats || { totalSeats: 0, availableSeats: 0, occupiedSeats: 0, unavailableSeats: 0 };
                  const isDeactivated = floor.status === 'Inactive';

                  return (
                    <tr
                      key={floor.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isDeactivated ? 'bg-slate-50/40 text-slate-500' : ''}`}
                    >
                      {/* Name & Order */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isDeactivated ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {floor.sortOrder || '#'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight text-sm">
                              {floor.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {floor.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            floor.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              floor.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {floor.status}
                        </span>
                      </td>

                      {/* Total Seats */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 text-sm">
                        {fStats.totalSeats}
                      </td>

                      {/* Available Seats */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                          {fStats.availableSeats}
                        </span>
                      </td>

                      {/* Occupied Seats */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200">
                          {fStats.occupiedSeats}
                        </span>
                      </td>

                      {/* Unavailable Seats */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200">
                          {fStats.unavailableSeats}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate" title={floor.description}>
                        {floor.description || <span className="text-slate-400 italic">No notes</span>}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active/Inactive */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(floor)}
                            title={floor.status === 'Active' ? 'Deactivate Floor' : 'Activate Floor'}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              floor.status === 'Active'
                                ? 'text-amber-700 border-amber-200 hover:bg-amber-50'
                                : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Floor */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFloorToEdit(floor);
                              setIsFloorModalOpen(true);
                            }}
                            title="Edit Floor Details"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Floor */}
                          <button
                            type="button"
                            onClick={() => handleInitiateDelete(floor)}
                            title="Remove Floor"
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
        )}
      </div>

      {/* Floor Modal (Add/Edit) */}
      <FloorModal
        isOpen={isFloorModalOpen}
        floorToEdit={selectedFloorToEdit}
        onClose={() => {
          setIsFloorModalOpen(false);
          setSelectedFloorToEdit(null);
        }}
      />

      {/* Confirmation Modal (Delete) */}
      <ConfirmationModal
        isOpen={floorToDelete !== null}
        title="Remove Floor"
        message={`Are you sure you want to permanently delete floor "${floorToDelete?.name}"? Deletion is only permitted if the floor contains no seats and has no historical allocations.`}
        confirmLabel="Remove Floor"
        cancelLabel="Keep Floor"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setFloorToDelete(null)}
      />
    </div>
  );
};
