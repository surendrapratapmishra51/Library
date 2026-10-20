import React, { useMemo } from 'react';
import { X, AlertTriangle, PlusCircle, Download, CheckCircle2 } from 'lucide-react';
import { AdminUser } from '../../../types';
import { Button } from '../../common/Button';

interface PendingDuesModalProps {
  isOpen: boolean;
  users: AdminUser[];
  onClose: () => void;
  onCollectPayment: (user: AdminUser) => void;
}

export const PendingDuesModal: React.FC<PendingDuesModalProps> = ({
  isOpen,
  users,
  onClose,
  onCollectPayment
}) => {
  const duesList = useMemo(() => {
    return users
      .filter((u) => u.role !== 'admin' && (Number(u.balanceDue) || 0) > 0)
      .sort((a, b) => (Number(b.balanceDue) || 0) - (Number(a.balanceDue) || 0));
  }, [users]);

  if (!isOpen) return null;

  const totalDuesAmount = duesList.reduce((sum, u) => sum + (Number(u.balanceDue) || 0), 0);

  const exportDuesCSV = () => {
    const headers = [
      'Member ID',
      'Student Name',
      'Mobile',
      'Assigned Desk',
      'Membership Plan',
      'Standard Fee (INR)',
      'Discount (INR)',
      'Final Payable (INR)',
      'Amount Received (INR)',
      'Balance Due (INR)',
      'Joining Date',
      'Expiry Date'
    ];

    const rows = duesList.map((u) => [
      `"${u.id}"`,
      `"${u.name}"`,
      `"${u.mobile}"`,
      `"${u.seat || 'None'}"`,
      `"${u.plan || 'Plan'}"`,
      u.baseFee || 0,
      u.discount || 0,
      u.finalFee || 0,
      u.paidAmount || 0,
      u.balanceDue || 0,
      `"${u.joiningDate || ''}"`,
      `"${u.expiryDate || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pending_dues_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-3xl w-full overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dues-modal-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="dues-modal-title" className="text-base font-bold text-slate-900 font-display">
                Pending Fee Dues Summary
              </h2>
              <p className="text-xs text-slate-500">
                {duesList.length} member{duesList.length === 1 ? '' : 's'} with total outstanding balance of <strong className="text-amber-900 font-mono">₹{totalDuesAmount.toLocaleString('en-IN')}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {duesList.length > 0 && (
              <button
                type="button"
                onClick={exportDuesCSV}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {duesList.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-sm">No Pending Dues Found!</p>
              <p className="text-xs text-slate-400 mt-1">
                All registered library members have completely paid their fees.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
                    <th className="py-2.5 px-3">Student & Mobile</th>
                    <th className="py-2.5 px-3">Seat</th>
                    <th className="py-2.5 px-3">Plan</th>
                    <th className="py-2.5 px-3 text-right">Payable</th>
                    <th className="py-2.5 px-3 text-right">Received</th>
                    <th className="py-2.5 px-3 text-right font-bold text-amber-900">Balance Due</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {duesList.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">{user.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{user.mobile}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                        {user.seat !== 'None' ? user.seat : '—'}
                      </td>
                      <td className="py-2.5 px-3 truncate max-w-[120px]">{user.plan}</td>
                      <td className="py-2.5 px-3 text-right font-mono">₹{user.finalFee}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-medium">
                        ₹{user.paidAmount}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-extrabold text-amber-700 text-sm">
                        ₹{user.balanceDue}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onCollectPayment(user);
                          }}
                          className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>Collect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Outstanding sum: <strong className="font-mono text-amber-800 font-bold">₹{totalDuesAmount.toLocaleString('en-IN')}</strong>
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
