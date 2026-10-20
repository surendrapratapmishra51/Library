import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLibrary } from '../../../context/LibraryContext';
import { AdmissionRequest } from '../../../types';
import { 
  UserPlus, 
  Search, 
  Filter, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  AlertTriangle, 
  Armchair, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  FileText,
  UserCheck,
  Check,
  X
} from 'lucide-react';

export const ManageAdmissions: React.FC = () => {
  const { 
    admissionRequests, 
    admissionStats, 
    refreshAdmissionRequests, 
    acceptAdmissionRequest, 
    rejectAdmissionRequest,
    seats,
    plans,
    refreshSeats
  } = useLibrary();

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Accepted' | 'Rejected'>('All');
  const [planFilter, setPlanFilter] = useState<string>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals state
  const [selectedRequest, setSelectedRequest] = useState<AdmissionRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  // Accept Form state
  const [acceptSeat, setAcceptSeat] = useState<string>('');
  const [acceptDiscount, setAcceptDiscount] = useState<number>(0);
  const [acceptDiscountReason, setAcceptDiscountReason] = useState<string>('');
  const [acceptPaidAmount, setAcceptPaidAmount] = useState<number>(0);
  const [acceptPaymentMethod, setAcceptPaymentMethod] = useState<string>('UPI');
  const [acceptPassword, setAcceptPassword] = useState<string>('student123');
  const [acceptNotes, setAcceptNotes] = useState<string>('');
  const [isSubmittingAccept, setIsSubmittingAccept] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  // Reject Form state
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load admission requests on component mount
  useEffect(() => {
    refreshAdmissionRequests();
    refreshSeats();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.allSettled([refreshAdmissionRequests(), refreshSeats()]);
    setIsRefreshing(false);
  };

  // Dynamic metrics calculation that works seamlessly with live state and backend stats
  const pendingCount = useMemo(() => {
    if (admissionStats?.pendingCount !== undefined && admissionStats.pendingCount > 0) {
      return admissionStats.pendingCount;
    }
    return (admissionRequests || []).filter((r) => r.status === 'Pending').length;
  }, [admissionStats?.pendingCount, admissionRequests]);

  const acceptedCount = useMemo(() => {
    if (admissionStats?.acceptedCount !== undefined && admissionStats.acceptedCount > 0) {
      return admissionStats.acceptedCount;
    }
    return (admissionRequests || []).filter((r) => r.status === 'Accepted').length;
  }, [admissionStats?.acceptedCount, admissionRequests]);

  const rejectedCount = useMemo(() => {
    if (admissionStats?.rejectedCount !== undefined && admissionStats.rejectedCount > 0) {
      return admissionStats.rejectedCount;
    }
    return (admissionRequests || []).filter((r) => r.status === 'Rejected').length;
  }, [admissionStats?.rejectedCount, admissionRequests]);

  const totalCount = useMemo(() => {
    if (admissionStats?.totalCount !== undefined && admissionStats.totalCount > 0) {
      return admissionStats.totalCount;
    }
    return (admissionRequests || []).length;
  }, [admissionStats?.totalCount, admissionRequests]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return (admissionRequests || []).filter((req) => {
      // Status filter
      if (statusFilter !== 'All' && req.status !== statusFilter) {
        return false;
      }
      // Plan filter
      if (planFilter !== 'All' && req.planId !== planFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchName = req.name?.toLowerCase().includes(q);
        const matchMobile = req.mobile?.includes(q);
        const matchSeat = req.preferredSeat?.toLowerCase().includes(q);
        const matchEmail = req.email?.toLowerCase().includes(q);
        if (!matchName && !matchMobile && !matchSeat && !matchEmail) {
          return false;
        }
      }
      return true;
    });
  }, [admissionRequests, statusFilter, planFilter, searchTerm]);

  // Open Details Modal
  const openDetailsModal = (req: AdmissionRequest) => {
    setSelectedRequest(req);
    setIsDetailsOpen(true);
  };

  // Open Accept Modal
  const openAcceptModal = (req: AdmissionRequest) => {
    setSelectedRequest(req);
    setAcceptError(null);
    setAcceptDiscount(0);
    setAcceptDiscountReason('');
    setAcceptPaidAmount(0);
    setAcceptPaymentMethod('UPI');
    setAcceptPassword('student123');
    setAcceptNotes(req.notes || '');

    // Check requested seat availability
    const prefSeatNo = (req.preferredSeat || '').toUpperCase().trim();
    const targetSeat = seats.find((s) => s.number.toUpperCase() === prefSeatNo);
    const isPrefSeatAvailable = targetSeat && targetSeat.status === 'available';

    if (isPrefSeatAvailable) {
      setAcceptSeat(targetSeat.number);
    } else {
      // Pick first available seat if requested is taken/empty
      const firstAvailable = seats.find((s) => s.status === 'available');
      setAcceptSeat(firstAvailable ? firstAvailable.number : '');
    }

    setIsAcceptOpen(true);
  };

  // Open Reject Modal
  const openRejectModal = (req: AdmissionRequest) => {
    setSelectedRequest(req);
    setRejectReason('');
    setRejectError(null);
    setIsRejectOpen(true);
  };

  // Handle Accept Submit
  const handleConfirmAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    if (!acceptSeat) {
      setAcceptError('Please select a seat to allocate for this student.');
      return;
    }

    setIsSubmittingAccept(true);
    setAcceptError(null);

    try {
      const res = await acceptAdmissionRequest(selectedRequest.id, {
        seatNumber: acceptSeat,
        discount: Number(acceptDiscount) || 0,
        discountReason: acceptDiscountReason,
        paidAmount: Number(acceptPaidAmount) || 0,
        paymentMethod: acceptPaymentMethod,
        password: acceptPassword,
        notes: acceptNotes
      });

      setIsSubmittingAccept(false);

      if (res.success) {
        setIsAcceptOpen(false);
        setSelectedRequest(null);
        setToastMessage({ type: 'success', text: res.message || 'Student admitted and seat allocated successfully!' });
      } else {
        setAcceptError(res.message || 'Failed to accept admission request.');
      }
    } catch (err: any) {
      setIsSubmittingAccept(false);
      setAcceptError(err.message || 'Error occurred while accepting request.');
    }
  };

  // Handle Reject Submit
  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setIsSubmittingReject(true);
    setRejectError(null);

    try {
      const res = await rejectAdmissionRequest(selectedRequest.id, {
        rejectionReason: rejectReason.trim() || 'Admission declined by administrator'
      });

      setIsSubmittingReject(false);

      if (res.success) {
        setIsRejectOpen(false);
        setSelectedRequest(null);
        setToastMessage({ type: 'success', text: res.message || 'Admission request marked as Rejected.' });
      } else {
        setRejectError(res.message || 'Failed to reject admission request.');
      }
    } catch (err: any) {
      setIsSubmittingReject(false);
      setRejectError(err.message || 'Error occurred while rejecting request.');
    }
  };

  // Available seats list for accept modal
  const availableSeats = useMemo(() => {
    return seats.filter((s) => s.status === 'available');
  }, [seats]);

  // Selected plan calculation for accept modal
  const selectedPlanDetails = useMemo(() => {
    if (!selectedRequest) return null;
    return plans.find((p) => p.id === selectedRequest.planId) || null;
  }, [selectedRequest, plans]);

  const basePrice = selectedPlanDetails ? Number(selectedPlanDetails.price) || 0 : 0;
  const finalCalculatedFee = Math.max(0, basePrice - (Number(acceptDiscount) || 0));
  const calculatedBalanceDue = Math.max(0, finalCalculatedFee - (Number(acceptPaidAmount) || 0));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 font-display">
              Admission Requests
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {pendingCount} Pending
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review public website seat reservations, verify applicant details, and allocate seats safely.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Card */}
        <div 
          onClick={() => setStatusFilter('Pending')}
          className={`cursor-pointer bg-white p-4 sm:p-5 rounded-2xl border transition-all shadow-xs ${
            statusFilter === 'Pending' 
              ? 'ring-2 ring-amber-500 border-amber-300' 
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Pending Requests
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {pendingCount}
            </span>
            <span className="text-[11px] text-amber-600 font-medium">Awaiting Review</span>
          </div>
        </div>

        {/* Accepted Card */}
        <div 
          onClick={() => setStatusFilter('Accepted')}
          className={`cursor-pointer bg-white p-4 sm:p-5 rounded-2xl border transition-all shadow-xs ${
            statusFilter === 'Accepted' 
              ? 'ring-2 ring-emerald-500 border-emerald-300' 
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Accepted & Enrolled
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {acceptedCount}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Seat Allotted</span>
          </div>
        </div>

        {/* Rejected Card */}
        <div 
          onClick={() => setStatusFilter('Rejected')}
          className={`cursor-pointer bg-white p-4 sm:p-5 rounded-2xl border transition-all shadow-xs ${
            statusFilter === 'Rejected' 
              ? 'ring-2 ring-rose-500 border-rose-300' 
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Rejected Requests
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {rejectedCount}
            </span>
            <span className="text-[11px] text-rose-600 font-medium">Declined</span>
          </div>
        </div>

        {/* Total Card */}
        <div 
          onClick={() => setStatusFilter('All')}
          className={`cursor-pointer bg-white p-4 sm:p-5 rounded-2xl border transition-all shadow-xs ${
            statusFilter === 'All' 
              ? 'ring-2 ring-indigo-500 border-indigo-300' 
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              Total Applications
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {totalCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">All Time</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by applicant name, mobile, seat, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-medium text-slate-600">
            {(['All', 'Pending', 'Accepted', 'Rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === tab
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Plan Dropdown */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium text-slate-700"
          >
            <option value="All">All Plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          {(statusFilter !== 'All' || planFilter !== 'All' || searchTerm.trim()) && (
            <button
              onClick={() => {
                setStatusFilter('All');
                setPlanFilter('All');
                setSearchTerm('');
              }}
              className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Applicant Name & Contact</th>
                <th className="px-5 py-3.5">Requested Seat</th>
                <th className="px-5 py-3.5">Selected Plan</th>
                <th className="px-5 py-3.5">Target Joining</th>
                <th className="px-5 py-3.5">Request Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <UserPlus className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No admission requests found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {statusFilter !== 'All' || searchTerm.trim()
                        ? 'Try adjusting your filters or search keywords.'
                        : 'New student applications submitted on the website will appear here.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const prefSeatNo = (req.preferredSeat || '').toUpperCase().trim();
                  const seatObj = seats.find((s) => s.number.toUpperCase() === prefSeatNo);
                  const isSeatAvailable = seatObj && seatObj.status === 'available';

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Contact */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{req.name}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-slate-500 text-[11px]">
                          <span className="font-mono">{req.mobile}</span>
                          {req.email && <span>· {req.email}</span>}
                        </div>
                      </td>

                      {/* Requested Seat & Real-Time Availability */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            Seat {req.preferredSeat || 'Auto'}
                          </span>
                          {req.status === 'Pending' && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                isSeatAvailable
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {isSeatAvailable ? 'Vacant Now' : 'Occupied'}
                            </span>
                          )}
                          {req.status === 'Accepted' && req.allocatedSeat && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Allotted: {req.allocatedSeat}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-800">
                          {req.planName || 'Standard Plan'}
                        </span>
                        {req.shiftTiming && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {req.shiftTiming}
                          </div>
                        )}
                      </td>

                      {/* Target Joining Date */}
                      <td className="px-5 py-3.5 text-slate-600 font-medium">
                        {req.startDate || 'Immediate'}
                      </td>

                      {/* Request Date */}
                      <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                        {req.createdAt
                          ? new Date(req.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          : '—'}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        {req.status === 'Pending' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Pending
                          </span>
                        )}
                        {req.status === 'Accepted' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Accepted
                          </span>
                        )}
                        {req.status === 'Rejected' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <X className="w-3 h-3 text-rose-600" />
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details */}
                          <button
                            onClick={() => openDetailsModal(req)}
                            title="View Full Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {req.status === 'Pending' && (
                            <>
                              {/* Accept Button */}
                              <button
                                onClick={() => openAcceptModal(req)}
                                title="Accept & Allocate Seat"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Accept</span>
                              </button>

                              {/* Reject Button */}
                              <button
                                onClick={() => openRejectModal(req)}
                                title="Reject Request"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Details Modal */}
      {isDetailsOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Admission Request Details
                </h3>
                <span className="text-xs text-slate-400">
                  Application ID: #{selectedRequest.id}
                </span>
              </div>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Status Header */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium">Request Status:</span>
                {selectedRequest.status === 'Pending' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    Pending Review
                  </span>
                )}
                {selectedRequest.status === 'Accepted' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Accepted & Allotted
                  </span>
                )}
                {selectedRequest.status === 'Rejected' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                    Rejected
                  </span>
                )}
              </div>

              {/* Applicant Info Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Applicant Name</span>
                  <p className="font-semibold text-slate-800 text-sm">{selectedRequest.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Mobile Number</span>
                  <p className="font-semibold text-slate-800 font-mono text-sm">{selectedRequest.mobile}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Email Address</span>
                  <p className="font-semibold text-slate-800">{selectedRequest.email || '—'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Date of Birth</span>
                  <p className="font-semibold text-slate-800">{selectedRequest.dob || '—'}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <span className="text-slate-400 font-medium">Residential Address</span>
                  <p className="font-semibold text-slate-800">{selectedRequest.address || '—'}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Requested Plan</span>
                  <p className="font-bold text-indigo-700">{selectedRequest.planName || 'Selected Plan'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Requested Seat</span>
                  <p className="font-mono font-bold text-slate-900">Seat {selectedRequest.preferredSeat || 'Auto'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Preferred Shift</span>
                  <p className="font-semibold text-slate-800">{selectedRequest.shiftTiming || '24/7'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Target Start Date</span>
                  <p className="font-semibold text-slate-800">{selectedRequest.startDate}</p>
                </div>
              </div>

              {selectedRequest.notes && (
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-slate-400 font-medium">Applicant Notes</span>
                  <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 mt-1 italic">
                    "{selectedRequest.notes}"
                  </p>
                </div>
              )}

              {/* Rejection Reason if Rejected */}
              {selectedRequest.status === 'Rejected' && selectedRequest.rejectionReason && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                  <span className="text-rose-800 font-bold flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" />
                    Rejection Reason
                  </span>
                  <p className="text-rose-700">{selectedRequest.rejectionReason}</p>
                </div>
              )}

              {/* Allocation Info if Accepted */}
              {selectedRequest.status === 'Accepted' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Allocation Information
                  </span>
                  <p className="text-emerald-700">
                    Allocated Seat: <strong>Seat {selectedRequest.allocatedSeat}</strong>
                  </p>
                  {selectedRequest.processedAt && (
                    <p className="text-[11px] text-emerald-600">
                      Processed on: {new Date(selectedRequest.processedAt).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
              >
                Close
              </button>
              {selectedRequest.status === 'Pending' && (
                <>
                  <button
                    onClick={() => {
                      setIsDetailsOpen(false);
                      openRejectModal(selectedRequest);
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setIsDetailsOpen(false);
                      openAcceptModal(selectedRequest);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                  >
                    Accept & Allocate Seat
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Accept & Allocate Modal */}
      {isAcceptOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  Accept Admission & Allocate Desk
                </h3>
                <span className="text-xs text-slate-400">
                  Applicant: <strong>{selectedRequest.name}</strong> ({selectedRequest.mobile})
                </span>
              </div>
              <button
                onClick={() => setIsAcceptOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAccept} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto text-xs">
              {acceptError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{acceptError}</span>
                </div>
              )}

              {/* Seat Verification Block */}
              {(() => {
                const prefSeat = (selectedRequest.preferredSeat || '').toUpperCase().trim();
                const matchedSeat = seats.find((s) => s.number.toUpperCase() === prefSeat);
                const isRequestedAvailable = matchedSeat && matchedSeat.status === 'available';

                return (
                  <div className={`p-4 rounded-xl border space-y-2 ${
                    isRequestedAvailable 
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                      : 'bg-amber-50/80 border-amber-200 text-amber-900'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <Armchair className="w-4 h-4" />
                        Requested Seat: {prefSeat || 'Auto'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isRequestedAvailable
                          ? 'bg-emerald-200 text-emerald-800'
                          : 'bg-rose-200 text-rose-800'
                      }`}>
                        {isRequestedAvailable ? 'Currently Vacant' : 'Currently Occupied'}
                      </span>
                    </div>

                    {!isRequestedAvailable && (
                      <p className="text-[11px] text-amber-800">
                        The requested seat is not currently vacant. You can reassign any other available seat from the dropdown below.
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Seat Assignment Dropdown */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Allocate Seat *
                </label>
                <select
                  value={acceptSeat}
                  onChange={(e) => setAcceptSeat(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono font-bold"
                >
                  <option value="">-- Choose Vacant Desk --</option>
                  {availableSeats.map((s) => (
                    <option key={s.id} value={s.number}>
                      Seat {s.number} {s.floorName ? `(${s.floorName})` : ''} — Available
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {availableSeats.length} seats currently vacant in library.
                </span>
              </div>

              {/* Fee & Payment Section (Consistent with Fees Management) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Membership Fees Setup
                  </span>
                  <span className="text-slate-500 font-medium">
                    Plan: <strong>{selectedPlanDetails?.name || selectedRequest.planName}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Base Membership Fee</span>
                    <span className="font-mono font-bold text-base text-slate-900">₹{basePrice}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Final Fee (After Discount)</span>
                    <span className="font-mono font-bold text-base text-emerald-700">₹{finalCalculatedFee}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={basePrice}
                      value={acceptDiscount || ''}
                      onChange={(e) => setAcceptDiscount(Math.max(0, Number(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Discount Reason
                    </label>
                    <input
                      type="text"
                      value={acceptDiscountReason}
                      onChange={(e) => setAcceptDiscountReason(e.target.value)}
                      placeholder="e.g. Student concession"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Initial Payment Received Now (Optional) */}
                <div className="border-t border-slate-200/70 pt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Initial Payment Collected Now (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={finalCalculatedFee}
                        value={acceptPaidAmount || ''}
                        onChange={(e) => setAcceptPaidAmount(Math.max(0, Number(e.target.value) || 0))}
                        placeholder="0 for pending fees"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold text-slate-900"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Balance due: <strong className="text-amber-700">₹{calculatedBalanceDue}</strong>
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Payment Method
                      </label>
                      <select
                        value={acceptPaymentMethod}
                        onChange={(e) => setAcceptPaymentMethod(e.target.value)}
                        disabled={acceptPaidAmount <= 0}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                      >
                        <option value="UPI">UPI / Google Pay</option>
                        <option value="Cash">Cash at Counter</option>
                        <option value="Card">Debit / Credit Card</option>
                        <option value="Net Banking">Net Banking</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Portal Password */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Student Portal Initial Password</span>
                  <span className="text-[10px] text-slate-400 font-normal">Student will use mobile & this password</span>
                </label>
                <input
                  type="text"
                  value={acceptPassword}
                  onChange={(e) => setAcceptPassword(e.target.value)}
                  placeholder="student123"
                  required
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Internal Staff Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={acceptNotes}
                  onChange={(e) => setAcceptNotes(e.target.value)}
                  placeholder="Any remarks, shift requirements, or special instructions..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50 -mx-6 -mb-6 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAcceptOpen(false)}
                  disabled={isSubmittingAccept}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAccept || !acceptSeat}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSubmittingAccept ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Allocating Seat...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Confirm & Enroll Student</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Reject Modal */}
      {isRejectOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  Reject Admission Request
                </h3>
                <span className="text-xs text-slate-400">
                  Applicant: <strong>{selectedRequest.name}</strong> ({selectedRequest.mobile})
                </span>
              </div>
              <button
                onClick={() => setIsRejectOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-6 space-y-4 text-xs">
              {rejectError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                  {rejectError}
                </div>
              )}

              <p className="text-slate-600">
                Are you sure you want to decline this admission application? The requested seat will remain available and no student account will be created.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason for Rejection (Saved for Audit & Records)
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Desired time slot fully booked, applicant unreachable, or duplicate request..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                />
              </div>

              <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50 -mx-6 -mb-6 mt-4">
                <button
                  type="button"
                  onClick={() => setIsRejectOpen(false)}
                  disabled={isSubmittingReject}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReject}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSubmittingReject ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5" />
                      <span>Confirm Rejection</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAdmissions;
