import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Tag, 
  Receipt, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import { AdminUser, MembershipPlan } from '../../../types';

interface StudentFeeLedgerProps {
  users: AdminUser[];
  plans: MembershipPlan[];
  onRecordPayment: (user: AdminUser) => void;
  onManageDiscount: (user: AdminUser) => void;
  onViewStatement: (user: AdminUser) => void;
  initialFilterStatus?: string;
  initialFilterDuesOnly?: boolean;
  appliedUserId?: string;
  appliedPlanId?: string;
  appliedFromDate?: string;
  appliedToDate?: string;
}

export const StudentFeeLedger: React.FC<StudentFeeLedgerProps> = ({
  users,
  plans,
  onRecordPayment,
  onManageDiscount,
  onViewStatement,
  initialFilterStatus = 'all',
  initialFilterDuesOnly = false,
  appliedUserId,
  appliedPlanId,
  appliedFromDate,
  appliedToDate,
}) => {
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilterStatus);
  const [planFilter, setPlanFilter] = useState<string>(appliedPlanId || 'all');
  const [duesOnly, setDuesOnly] = useState<boolean>(initialFilterDuesOnly);
  const [sortBy, setSortBy] = useState<'name' | 'balanceDue' | 'paidAmount' | 'joiningDate'>('balanceDue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Exclude admin accounts from student fee ledger
      if (u.role === 'admin') return false;

      // Status evaluation: treat Pending as Unpaid
      const normalizedStatus = (u.paymentStatus === 'Pending' || !u.paymentStatus) ? 'Unpaid' : u.paymentStatus;

      // Global User Filter
      if (appliedUserId && appliedUserId !== 'all' && u.id !== appliedUserId) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'Unpaid' && normalizedStatus !== 'Unpaid') return false;
        if (statusFilter === 'Paid' && normalizedStatus !== 'Paid') return false;
        if (statusFilter === 'Partial' && normalizedStatus !== 'Partial') return false;
      }

      // Dues only filter
      if (duesOnly) {
        if ((Number(u.balanceDue) || 0) <= 0) return false;
      }

      // Plan filter (global or local)
      const effectivePlan = (appliedPlanId && appliedPlanId !== 'all') ? appliedPlanId : planFilter;
      if (effectivePlan !== 'all') {
        if (u.planId !== effectivePlan && u.plan !== effectivePlan) return false;
      }

      // Date bounds on membership joining date if specified
      if (appliedToDate && u.joiningDate && u.joiningDate > appliedToDate) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesId = u.id.toLowerCase().includes(q);
        const matchesMobile = u.mobile.toLowerCase().includes(q);
        const matchesSeat = u.seat ? u.seat.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesId && !matchesMobile && !matchesSeat) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'balanceDue') {
        comparison = (Number(a.balanceDue) || 0) - (Number(b.balanceDue) || 0);
      } else if (sortBy === 'paidAmount') {
        comparison = (Number(a.paidAmount) || 0) - (Number(b.paidAmount) || 0);
      } else if (sortBy === 'joiningDate') {
        comparison = (a.joiningDate || '').localeCompare(b.joiningDate || '');
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [users, searchTerm, statusFilter, planFilter, duesOnly, sortBy, sortOrder]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: 'name' | 'balanceDue' | 'paidAmount' | 'joiningDate') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPlanFilter('all');
    setDuesOnly(false);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Header & Search Bar */}
      <div className="p-5 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">
              Student Fee Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive member fee accounts, installment tracking, and balance dues
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0 self-start md:self-auto">
            Showing <strong className="text-slate-800">{filteredUsers.length}</strong> of {users.filter(u => u.role !== 'admin').length} students
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name, ID, mobile, seat..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Paid">Fully Paid</option>
              <option value="Partial">Partially Paid</option>
              <option value="Unpaid">Unpaid / Zero Paid</option>
            </select>
          </div>

          {/* Plan Filter */}
          <div>
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            >
              <option value="all">All Membership Plans</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (₹{p.price})
                </option>
              ))}
            </select>
          </div>

          {/* Dues Only Checkbox & Reset */}
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={duesOnly}
                onChange={(e) => {
                  setDuesOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Only with Dues (&gt; ₹0)</span>
            </label>

            {(searchTerm || statusFilter !== 'all' || planFilter !== 'all' || duesOnly) && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Student & Member ID</th>
              <th className="py-3 px-3">Plan</th>
              <th className="py-3 px-3 text-right">Standard Fee</th>
              <th className="py-3 px-3 text-right">Discount</th>
              <th className="py-3 px-3 text-right">Final Payable</th>
              <th 
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100/80 transition-colors"
                onClick={() => handleSort('paidAmount')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Received</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100/80 transition-colors"
                onClick={() => handleSort('balanceDue')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Balance Due</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3">Validity</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center">
                  <div className="max-w-xs mx-auto flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-slate-800 text-sm">No student records found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      No members match the selected filters. Try resetting search or filter criteria.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => {
                const bFee = Number(user.baseFee) || 0;
                const disc = Number(user.discount) || 0;
                const fFee = Number(user.finalFee) || Math.max(0, bFee - disc);
                const pAmount = Number(user.paidAmount) || 0;
                const bDue = Number(user.balanceDue) || Math.max(0, fFee - pAmount);

                const normalizedStatus = (user.paymentStatus === 'Pending' || !user.paymentStatus) ? 'Unpaid' : user.paymentStatus;

                let statusBadgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
                if (normalizedStatus === 'Paid') {
                  statusBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                } else if (normalizedStatus === 'Partial') {
                  statusBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                }

                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student Name & Member ID */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 leading-tight">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {user.id} · {user.mobile}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                          {user.seat !== 'None' ? `Seat ${user.seat}` : 'No Seat'}
                        </span>
                        {user.status === 'Discontinued' && (
                          <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1 rounded">
                            Discontinued
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Membership Plan */}
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800 block truncate max-w-[120px]">
                        {user.plan || 'Plan'}
                      </span>
                    </td>

                    {/* Standard Fee */}
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-600">
                      ₹{bFee.toLocaleString('en-IN')}
                    </td>

                    {/* Discount & Reason */}
                    <td className="py-3 px-3 text-right">
                      {disc > 0 ? (
                        <div>
                          <span className="font-mono font-semibold text-sky-700">
                            -₹{disc.toLocaleString('en-IN')}
                          </span>
                          {user.discountReason && (
                            <span 
                              className="text-[10px] text-slate-400 block truncate max-w-[100px] text-right"
                              title={user.discountReason}
                            >
                              {user.discountReason}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">₹0</span>
                      )}
                    </td>

                    {/* Final Payable */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{fFee.toLocaleString('en-IN')}
                    </td>

                    {/* Amount Received */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                      ₹{pAmount.toLocaleString('en-IN')}
                    </td>

                    {/* Balance Due */}
                    <td className="py-3 px-3 text-right">
                      <span className={`font-mono font-extrabold ${bDue > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                        ₹{bDue.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Payment Status Badge */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadgeClass}`}>
                        {normalizedStatus}
                      </span>
                    </td>

                    {/* Start & Expiry Date */}
                    <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                      <div><strong className="text-slate-700">{user.joiningDate || '—'}</strong></div>
                      <div className="text-[10px] text-slate-400">Exp: {user.expiryDate || '—'}</div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Record Payment Button */}
                        <button
                          type="button"
                          onClick={() => onRecordPayment(user)}
                          disabled={bDue === 0}
                          className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent cursor-pointer"
                          title={bDue > 0 ? "Record Payment Installment" : "Balance Fully Cleared"}
                          aria-label={`Record Payment for ${user.name}`}
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>

                        {/* Manage Discount Button */}
                        <button
                          type="button"
                          onClick={() => onManageDiscount(user)}
                          className="p-1.5 rounded-lg text-sky-700 hover:bg-sky-50 border border-transparent hover:border-sky-200 transition-colors cursor-pointer"
                          title="Manage Individual Discount"
                          aria-label={`Manage Discount for ${user.name}`}
                        >
                          <Tag className="w-4 h-4" />
                        </button>

                        {/* View Statement Button */}
                        <button
                          type="button"
                          onClick={() => onViewStatement(user)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                          title="View Complete Fee Statement"
                          aria-label={`View Fee Statement for ${user.name}`}
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-slate-50 border border-slate-300 rounded font-medium text-xs focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-slate-400 ml-2">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-2 font-mono font-semibold text-slate-800">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
