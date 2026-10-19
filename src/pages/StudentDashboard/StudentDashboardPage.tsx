import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { mockStudentAttendance, mockStudentPayments } from '../../data/mockStudents';
import { Link } from 'react-router-dom';
import { 
  User, 
  Armchair, 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  ArrowUpRight,
  LogOut
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { student, logout } = useLibrary();

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Welcome Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl font-display shadow-sm">
            {(student?.name || 'S').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 font-display">
                {student?.name || 'Student Member'}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                {student?.membershipStatus || 'Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Member ID: <span className="font-mono text-slate-700">{student?.id || 'Pending'}</span> · Enrolled: {student?.startDate || 'Recent'}
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

      {/* Main Stats 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Assigned Seat */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Reserved Carrel
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Armchair className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold font-mono text-slate-900">
              Seat {student.assignedSeat}
            </div>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              Dedicated 24/7 Lock Status: Active
            </p>
          </div>
        </div>

        {/* Card 2: Current Membership Plan */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Current Plan
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 font-display">
              {student.planName}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Valid until: <strong className="text-slate-800">{student.expiryDate}</strong>
            </p>
          </div>
        </div>

        {/* Card 3: Today's Attendance */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today's Attendance
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-700 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              {student.todayStatus}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Punched in at <strong className="text-slate-800">{student.checkInTime}</strong> via Gate 1
            </p>
          </div>
        </div>

        {/* Card 4: Fee & Renewal Status */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Renewal Date
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {student.nextRenewalDate || student.expiryDate || 'N/A'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Last paid: {student.lastPayment ? `₹${student.lastPayment.amount} (${student.lastPayment.date})` : 'No receipts yet'}
            </p>
          </div>
        </div>

      </div>

      {/* Profile & Member Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 font-display mb-4">
          Student Information & Credentials
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Mobile Phone:</span>
            <span className="font-semibold text-slate-800 font-mono text-sm">{student.mobile || 'Not provided'}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Registered Email:</span>
            <span className="font-semibold text-slate-800 text-sm">{student.email || 'Not provided'}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Date of Birth:</span>
            <span className="font-semibold text-slate-800 text-sm">{student.dob || 'Not provided'}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Residential Address:</span>
            <span className="font-semibold text-slate-800 text-sm">{student.address || 'Not provided'}</span>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Recent Attendance History (Biometric RFID Logs)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Automated timestamp records from entrance turnstile</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
            Biometric Sync Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Entry Punch</th>
                <th className="p-4 font-semibold">Exit Punch</th>
                <th className="p-4 font-semibold">Duration Focused</th>
                <th className="p-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {mockStudentAttendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No attendance punches recorded yet. RFID turnstile records appear here automatically.
                  </td>
                </tr>
              ) : (
                mockStudentAttendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-medium text-slate-900 font-mono">{rec.date}</td>
                    <td className="p-4 font-mono">{rec.entryTime}</td>
                    <td className="p-4 font-mono">{rec.exitTime}</td>
                    <td className="p-4 font-semibold text-slate-900">{rec.durationHours}</td>
                    <td className="p-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full font-medium ${
                          rec.status === 'In Progress'
                            ? 'bg-emerald-100 text-emerald-800 font-semibold'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment & Invoice Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Payment & Subscription Receipts
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Official invoices for fee submissions and renewals</p>
          </div>
          <button
            onClick={() => alert('Official receipts generated by administrator upon fee payment.')}
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download All Receipts</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="p-4 font-semibold">Transaction ID</th>
                <th className="p-4 font-semibold">Plan Enrolled</th>
                <th className="p-4 font-semibold">Amount Paid</th>
                <th className="p-4 font-semibold">Date of Payment</th>
                <th className="p-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {mockStudentPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No payment receipts issued yet.
                  </td>
                </tr>
              ) : (
                mockStudentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-medium text-slate-900">{p.transactionId}</td>
                    <td className="p-4 text-slate-800">{p.planName}</td>
                    <td className="p-4 font-bold font-mono text-slate-900">₹{p.amount.toLocaleString()}</td>
                    <td className="p-4 font-mono">{p.paymentDate}</td>
                    <td className="p-4 text-right">
                      <span className="px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 font-semibold">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
