import React, { useState, useEffect } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { paymentApi, PaymentItem } from '../../services/paymentApi';
import { Link, Navigate } from 'react-router-dom';
import { 
  Armchair, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  FileText, 
  LogOut,
  Receipt,
  Printer,
  X,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Tag
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { student, logout, isAuthenticated, userRole } = useLibrary();

  // Route Guard: Require authentication to view dashboard
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState<boolean>(true);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentItem | null>(null);

  // Fetch real payment transactions from database
  useEffect(() => {
    let isMounted = true;
    const fetchStudentPayments = async () => {
      if (!student?.id) return;
      setIsLoadingPayments(true);
      try {
        const data = await paymentApi.getUserPayments(student.id);
        if (isMounted && Array.isArray(data)) {
          setPayments(data);
        }
      } catch (err) {
        console.info('[StudentDashboard] Error fetching payments:', err);
      } finally {
        if (isMounted) setIsLoadingPayments(false);
      }
    };

    fetchStudentPayments();
    return () => { isMounted = false; };
  }, [student?.id]);

  // Derived financial values
  const baseFee = Number(student?.baseFee) || 0;
  const discount = Number(student?.discount) || 0;
  const finalFee = Number(student?.finalFee) || Math.max(0, baseFee - discount);
  const totalPaid = payments.length > 0 
    ? payments.reduce((sum, p) => p.status === 'Completed' ? sum + Number(p.amount) : sum, 0)
    : (Number(student?.paidAmount) || 0);
  const balanceDue = Math.max(0, finalFee - totalPaid);

  const latestPayment = payments.find((p) => p.status === 'Completed');

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Welcome Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold text-2xl font-display shadow-xs">
            {(student?.name || 'S').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 font-display">
                {student?.name || 'Student Member'}
              </h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                student?.membershipStatus === 'Active' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {student?.membershipStatus || 'Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Member ID: <span className="font-mono font-bold text-slate-700">{student?.id || 'Pending'}</span> · Enrolled: {student?.startDate || 'Recent'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/seats"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Armchair className="w-3.5 h-3.5 text-slate-600" />
            <span>View Hall Seats</span>
          </Link>
          <button
            onClick={logout}
            className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Stats Grid: 4 Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Reserved Desk / Carrel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Reserved Carrel
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <Armchair className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold font-mono text-slate-900">
              {student.assignedSeat && student.assignedSeat !== 'None' ? `Seat ${student.assignedSeat}` : 'No Seat Assigned'}
            </div>
            <p className="text-xs text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Dedicated 24/7 Lock Status: Active</span>
            </p>
          </div>
        </div>

        {/* Card 2: Current Membership Plan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Current Plan
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 font-display">
              {student.planName || 'Membership Plan'}
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Valid until: <strong className="text-slate-800">{student.expiryDate || 'N/A'}</strong>
            </p>
          </div>
        </div>

        {/* Card 3: Fee & Balance Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Fee & Balance
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              balanceDue > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold font-mono text-slate-900">
              {balanceDue > 0 ? `₹${balanceDue.toLocaleString('en-IN')} Due` : '₹0 Due'}
            </div>
            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                Paid: ₹{totalPaid.toLocaleString('en-IN')}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                balanceDue === 0 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : totalPaid > 0 
                  ? 'bg-amber-50 text-amber-800 border-amber-200' 
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {balanceDue === 0 ? 'Fully Paid' : totalPaid > 0 ? 'Partially Paid' : 'Unpaid'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Renewal Date */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Renewal Date
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {student.expiryDate || student.nextRenewalDate || 'N/A'}
            </div>
            <p className="text-xs text-slate-500 mt-1.5 truncate">
              {latestPayment 
                ? `Last paid: ₹${Number(latestPayment.amount).toLocaleString('en-IN')} (${latestPayment.paymentDate})`
                : 'No payments recorded yet'}
            </p>
          </div>
        </div>

      </div>

      {/* Member Profile Details & Fee Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Student Information & Credentials */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <Phone className="w-4 h-4 text-sky-600" />
              <span>Student Profile & Contact Details</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">ID: {student.id}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1 font-medium">Registered Mobile Phone</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {student.mobile || 'Not provided'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1 font-medium">Registered Email Address</span>
              <span className="font-bold text-slate-900 text-sm truncate block">
                {student.email || 'Not provided'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1 font-medium">Enrolled Desk Carrel</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {student.assignedSeat && student.assignedSeat !== 'None' ? `Desk ${student.assignedSeat}` : 'None Assigned'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1 font-medium">Residential / Hostel Address</span>
              <span className="font-semibold text-slate-800 text-xs block">
                {student.address || 'Address not registered'}
              </span>
            </div>
          </div>
        </div>

        {/* Fee Breakdown Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>Fee Structure</span>
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              balanceDue === 0 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {balanceDue === 0 ? 'Cleared' : 'Pending'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Standard Plan Fee:</span>
              <span className="font-mono font-medium text-slate-800">₹{baseFee.toLocaleString('en-IN')}</span>
            </div>

            {discount > 0 && (
              <div className="flex items-center justify-between text-sky-700">
                <span>Discount / Concession:</span>
                <span className="font-mono font-semibold">-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex items-center justify-between font-bold text-slate-900 pt-2 border-t border-slate-100">
              <span>Final Payable Fee:</span>
              <span className="font-mono">₹{finalFee.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-between text-emerald-700 font-semibold">
              <span>Amount Paid (Received):</span>
              <span className="font-mono">₹{totalPaid.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-between text-amber-800 font-bold pt-2 border-t border-slate-100">
              <span>Remaining Balance Due:</span>
              <span className="font-mono text-sm">₹{balanceDue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Payment & Subscription Receipts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Receipt className="w-4 h-4 text-sky-600" />
              <span>Payment & Subscription Receipts</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Official transaction receipts and installment history recorded in library accounts
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-lg self-start sm:self-auto">
            {payments.length} Transaction{payments.length === 1 ? '' : 's'} Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider font-semibold text-[11px]">
                <th className="p-4">Transaction Ref</th>
                <th className="p-4">Membership Plan</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4 text-right">Amount Paid</th>
                <th className="p-4 text-center">Payment Date</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoadingPayments ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading official payment records...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    No payment receipts recorded for this member yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {p.transactionId || p.id}
                    </td>
                    <td className="p-4 font-medium text-slate-800">
                      {p.planName || student.planName}
                    </td>
                    <td className="p-4 text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-[11px]">
                        {p.paymentMethod || 'Cash'}
                      </span>
                    </td>
                    <td className="p-4 font-bold font-mono text-emerald-700 text-right text-sm">
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 font-mono text-center text-slate-600">
                      {p.paymentDate}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(p)}
                        className="px-2.5 py-1 rounded-lg text-sky-700 hover:bg-sky-50 border border-sky-200 font-semibold text-xs flex items-center gap-1 mx-auto transition-colors cursor-pointer"
                        title="View & Print Official Receipt"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Slip</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Official Payment Receipt
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-4 printable-receipt">
              <div className="text-center pb-4 border-b border-slate-200">
                <h4 className="text-base font-extrabold text-slate-900 font-display">
                  FocusZone Digital Study Library
                </h4>
                <p className="text-[11px] text-slate-500">
                  Civil Lines Branch · 24/7 Silent Reading Space
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Payment Status: {selectedReceipt.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt / Transaction Ref:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedReceipt.transactionId || selectedReceipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Member Name:</span>
                  <span className="font-bold text-slate-900">{student.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Member ID / Mobile:</span>
                  <span className="font-mono text-slate-800">{student.id} · {student.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Allocated Carrel:</span>
                  <span className="font-mono font-bold text-slate-900">Seat {student.assignedSeat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Membership Plan:</span>
                  <span className="font-medium text-slate-800">{selectedReceipt.planName || student.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Date:</span>
                  <span className="font-mono text-slate-800">{selectedReceipt.paymentDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-medium text-slate-800">{selectedReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">Amount Received:</span>
                <span className="text-lg font-extrabold font-mono text-emerald-700">
                  ₹{Number(selectedReceipt.amount).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="text-[10px] text-slate-400 text-center pt-2">
                This is a computer-generated official receipt issued by FocusZone Library Management System.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
