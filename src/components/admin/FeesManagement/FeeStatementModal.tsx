import React, { useState, useEffect } from 'react';
import { X, Printer, FileText, CheckCircle2, Clock, AlertCircle, Building2, User } from 'lucide-react';
import { paymentApi, UserStatementResponse } from '../../../services/paymentApi';
import { Button } from '../../common/Button';

interface FeeStatementModalProps {
  isOpen: boolean;
  userId: string | null;
  onClose: () => void;
}

export const FeeStatementModal: React.FC<FeeStatementModalProps> = ({
  isOpen,
  userId,
  onClose,
}) => {
  const [statement, setStatement] = useState<UserStatementResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !userId) {
      setStatement(null);
      return;
    }

    const fetchStatement = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const data = await paymentApi.getUserStatement(userId);
        setStatement(data);
      } catch (err: any) {
        setErrorMsg(err?.data?.error || err?.message || 'Failed to fetch member statement.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatement();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const member = statement?.member;
  const transactions = statement?.transactions || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="statement-modal-title"
      >
        {/* Header (No print controls included here) */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="statement-modal-title" className="text-base font-bold text-slate-900 font-display">
                Member Fee Statement
              </h2>
              <p className="text-xs text-slate-500">
                Official payment statement and installment ledger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={isLoading || !statement}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Statement</span>
            </button>

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

        {/* Modal Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading fee statement from database...
            </div>
          ) : errorMsg ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : member ? (
            <div className="space-y-6 printable-statement">
              {/* Library Branding Header */}
              <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-display tracking-tight">
                    FocusZone Digital Study Library
                  </h3>
                  <p className="text-xs text-slate-500">
                    Civil Lines Branch · 24/7 Digital Learning Space
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    GSTIN / Reg: FZ-LIB-2026-IND
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Statement Date
                  </span>
                  <span className="text-xs font-semibold font-mono text-slate-800">
                    {new Date().toISOString().split('T')[0]}
                  </span>
                  <div className="mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      member.paymentStatus === 'Paid'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : member.paymentStatus === 'Partial'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      Status: {member.paymentStatus === 'Pending' ? 'Unpaid' : member.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Student Information Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Member Name
                  </span>
                  <span className="font-bold text-slate-900">{member.name}</span>
                  <span className="text-[10px] font-mono text-slate-500 block">{member.id}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Assigned Desk
                  </span>
                  <span className="font-bold font-mono text-slate-900">
                    {member.seat !== 'None' ? `Seat ${member.seat}` : 'None'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">{member.mobile}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Plan
                  </span>
                  <span className="font-bold text-slate-900">{member.plan}</span>
                  <span className="text-[10px] text-slate-500 block">Status: {member.status}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Membership Validity
                  </span>
                  <span className="font-bold font-mono text-slate-900">{member.joiningDate || '—'}</span>
                  <span className="text-[10px] text-slate-500 block">To: {member.expiryDate || '—'}</span>
                </div>
              </div>

              {/* Fee Breakdown Summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Membership Fee Structure
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-4 p-3 bg-slate-50 font-semibold text-slate-600 border-b border-slate-200">
                    <span>Standard Fee</span>
                    <span>Discount Applied</span>
                    <span>Final Payable</span>
                    <span className="text-right">Balance Due</span>
                  </div>
                  <div className="grid grid-cols-4 p-3 font-mono">
                    <span className="text-slate-800">₹{member.baseFee}</span>
                    <span className="text-sky-700">
                      {member.discount > 0 ? `-₹${member.discount}` : '₹0'}
                      {member.discountReason && (
                        <span className="text-[10px] text-slate-400 block font-sans">
                          ({member.discountReason})
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-slate-900">₹{member.finalFee}</span>
                    <span className={`text-right font-extrabold ${member.balanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      ₹{member.balanceDue}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Installment Transactions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Payment Installment History ({transactions.length} record{transactions.length === 1 ? '' : 's'})
                  </h4>
                  <span className="text-xs font-bold text-emerald-800 font-mono">
                    Total Received: ₹{member.paidAmount}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Transaction / Ref ID</th>
                        <th className="py-2.5 px-3">Mode</th>
                        <th className="py-2.5 px-3">Notes</th>
                        <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                            No payment transactions recorded for this membership yet.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((tx, idx) => (
                          <tr key={tx.id || idx}>
                            <td className="py-2.5 px-3 font-mono">{tx.paymentDate}</td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                              {tx.transactionId || tx.id}
                            </td>
                            <td className="py-2.5 px-3">{tx.paymentMethod}</td>
                            <td className="py-2.5 px-3 text-slate-500 text-[11px] truncate max-w-[150px]">
                              {tx.notes || '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                              ₹{tx.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="border-t border-slate-200 bg-slate-50 font-bold">
                      <tr>
                        <td colSpan={4} className="py-2.5 px-3 text-slate-700 text-right">
                          Total Realized Amount:
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-800 text-sm">
                          ₹{member.paidAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Computer generated fee statement. FocusZone Digital Library.</span>
                <span className="font-mono">Authorized Management Seal</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
