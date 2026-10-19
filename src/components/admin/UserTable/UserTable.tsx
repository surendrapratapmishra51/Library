import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Eye, 
  Edit2, 
  ArrowRightLeft, 
  UserMinus, 
  CheckCircle2, 
  AlertCircle,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { AdminUser } from '../../../types';
import { useLibrary } from '../../../context/LibraryContext';
import { Button } from '../../common/Button';
import { UserModal } from '../UserForm/UserModal';
import { ChangeSeatModal } from '../ChangeSeatModal/ChangeSeatModal';
import { UserDetailsModal } from '../UserDetails/UserDetailsModal';
import { ConfirmationModal } from '../ConfirmationModal/ConfirmationModal';

export const UserTable: React.FC = () => {
  const { users, plans, discontinueUser } = useLibrary();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Discontinued'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Modal controls
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);
  const [seatChangeUser, setSeatChangeUser] = useState<AdminUser | null>(null);
  const [discontinueTarget, setDiscontinueTarget] = useState<AdminUser | null>(null);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search query (name or mobile or seat)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (user.name || '').toLowerCase().includes(q);
        const matchesMobile = user.mobile ? String(user.mobile).includes(q) : false;
        const matchesSeat = (user.seat || '').toLowerCase().includes(q);
        if (!matchesName && !matchesMobile && !matchesSeat) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && user.status !== statusFilter) {
        return false;
      }

      // Plan filter
      if (planFilter !== 'all' && user.planId !== planFilter && user.plan !== planFilter) {
        return false;
      }

      return true;
    });
  }, [users, searchQuery, statusFilter, planFilter]);

  const handleConfirmDiscontinue = async () => {
    if (discontinueTarget) {
      await discontinueUser(discontinueTarget.id);
      setDiscontinueTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar: Add User & Search/Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Registered Library Members
            </h2>
            <p className="text-xs text-slate-500">
              Manage student enrollment records, seat allocations, and renewals
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddUserOpen(true)}
            className="self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, mobile, seat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
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

            {/* Status Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Status
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Active')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  statusFilter === 'Active'
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Discontinued')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  statusFilter === 'Discontinued'
                    ? 'bg-white text-rose-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Discontinued
              </button>
            </div>

            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              <option value="all">All Plans</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium self-end md:self-auto">
            Showing <strong className="text-slate-800 font-mono">{filteredUsers.length}</strong> of {users.length} members
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Mobile</th>
                <th className="p-4 font-semibold">Plan</th>
                <th className="p-4 font-semibold">Seat</th>
                <th className="p-4 font-semibold">Joining Date</th>
                <th className="p-4 font-semibold">Expiry Date</th>
                <th className="p-4 font-semibold">Fee / Due</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-600">No members match your criteria</p>
                    <p className="text-xs mt-1">Try resetting the search bar or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-bold text-slate-900">
                      <div>
                        {user.name}
                        <span className="block text-[11px] font-normal text-slate-400 font-mono">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono">{user.mobile}</td>
                    <td className="p-4 font-medium text-slate-800">{user.plan}</td>
                    <td className="p-4">
                      {user.status === 'Active' && user.seat && user.seat !== 'None' ? (
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Seat {user.seat}
                        </span>
                      ) : (
                        <span className="font-mono text-slate-400 text-[11px]">
                          Released {user.previousSeat ? `(${user.previousSeat})` : ''}
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono">{user.joiningDate}</td>
                    <td className="p-4 font-mono">{user.expiryDate}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-900 font-mono">
                          ₹{user.finalFee ?? user.baseFee ?? 0}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-block w-fit ${
                          user.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : user.paymentStatus === 'Partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {user.paymentStatus === 'Paid' ? 'Paid' : user.paymentStatus === 'Partial' ? `Due ₹${user.balanceDue}` : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                          user.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Action: View */}
                        <button
                          type="button"
                          title="View Member Profile"
                          onClick={() => setViewingUser(user)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Action: Edit */}
                        <button
                          type="button"
                          title="Edit Details"
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Action: Change Seat (only for active members) */}
                        {user.status === 'Active' && (
                          <button
                            type="button"
                            title="Change Assigned Seat"
                            onClick={() => setSeatChangeUser(user)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Action: Discontinue (only for active members) */}
                        {user.status === 'Active' && (
                          <button
                            type="button"
                            title="Discontinue Member"
                            onClick={() => setDiscontinueTarget(user)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add / Edit User */}
      <UserModal
        isOpen={isAddUserOpen || editingUser !== null}
        userToEdit={editingUser}
        onClose={() => {
          setIsAddUserOpen(false);
          setEditingUser(null);
        }}
      />

      {/* Modal 2: Change Seat */}
      <ChangeSeatModal
        isOpen={seatChangeUser !== null}
        user={seatChangeUser}
        onClose={() => setSeatChangeUser(null)}
      />

      {/* Modal 3: View Details */}
      <UserDetailsModal
        isOpen={viewingUser !== null}
        user={viewingUser}
        onClose={() => setViewingUser(null)}
      />

      {/* Modal 4: Discontinue Confirmation */}
      <ConfirmationModal
        isOpen={discontinueTarget !== null}
        title="Discontinue Library Member"
        message={`Are you sure you want to discontinue ${discontinueTarget?.name}? Their assigned desk (${discontinueTarget?.seat}) will become immediately Available for other students. Their historical admission records will be preserved.`}
        confirmLabel="Discontinue & Release Seat"
        cancelLabel="Keep Active"
        variant="danger"
        onConfirm={handleConfirmDiscontinue}
        onClose={() => setDiscontinueTarget(null)}
      />

    </div>
  );
};
