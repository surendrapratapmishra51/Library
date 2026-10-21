import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Calendar, Armchair, Building2, User, RefreshCw } from 'lucide-react';
import { SeatAllocation } from '../../../types';
import { seatApi } from '../../../services';
import { useLibrary } from '../../../context/LibraryContext';

export const AllocationHistoryTable: React.FC = () => {
  const { floors } = useLibrary();
  const [allocations, setAllocations] = useState<SeatAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchMember, setSearchMember] = useState('');
  const [searchSeat, setSearchSeat] = useState('');
  const [filterFloor, setFilterFloor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const records = await seatApi.getAllocationHistory({
        member: searchMember.trim() || undefined,
        seatNumber: searchSeat.trim() || undefined,
        floorName: filterFloor !== 'all' ? filterFloor : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      });
      setAllocations(records || []);
    } catch (err: any) {
      console.error('[AllocationHistory Error]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterFloor, filterStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Member Search */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search member name or mobile..."
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Seat Number Filter */}
          <div className="relative w-full sm:w-36">
            <Armchair className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Seat e.g. A01"
              value={searchSeat}
              onChange={(e) => setSearchSeat(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
            />
          </div>

          {/* Floor Filter */}
          <select
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All Floors</option>
            {floors.map((fl) => (
              <option key={fl.id} value={fl.name}>
                {fl.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All Allocation Statuses</option>
            <option value="Active">Active Allocation</option>
            <option value="Transferred">Transferred</option>
            <option value="Released">Released</option>
            <option value="Expired">Expired</option>
          </select>

          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Filter
          </button>
        </div>

        <button
          type="button"
          onClick={fetchHistory}
          disabled={isLoading}
          className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit Log</span>
        </button>
      </form>

      {/* Allocation History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {allocations.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <History className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-700">No Allocation Records Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Historical desk allocations, transfers, and releases will appear here in chronological order.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Seat Number</th>
                  <th className="py-3 px-4">Floor Level</th>
                  <th className="py-3 px-4">Allocation Period</th>
                  <th className="py-3 px-4">Release Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {allocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Member */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                          {alloc.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block leading-tight">
                            {alloc.userName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {alloc.userIdentifier || alloc.userId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Seat Number */}
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800 text-sm">
                      {alloc.seatNumber}
                    </td>

                    {/* Floor Name */}
                    <td className="py-3 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{alloc.floorName || 'No Floor'}</span>
                      </span>
                    </td>

                    {/* Allocation Period */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      <span>{alloc.startDate}</span>
                      <span className="text-slate-400 mx-1">→</span>
                      <span className="text-slate-800">{alloc.endDate || 'Ongoing'}</span>
                    </td>

                    {/* Release Date */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {alloc.releaseDate ? (
                        <span className="text-slate-600">{alloc.releaseDate}</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 text-[10px]">
                          Currently Occupied
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          alloc.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : alloc.status === 'Transferred'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : alloc.status === 'Released'
                            ? 'bg-slate-100 text-slate-600 border border-slate-300'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {alloc.status}
                      </span>
                    </td>

                    {/* Action Type */}
                    <td className="py-3 px-4 font-semibold text-slate-700 text-[11px]">
                      {alloc.actionType || 'Enrolled'}
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={alloc.notes || ''}>
                      {alloc.notes || <span className="text-slate-400 italic">None</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
