import React from 'react';
import { PaymentItem } from '../../../services/paymentApi';
import { Receipt, CheckCircle2, Clock, XCircle, FileText, ArrowRight } from 'lucide-react';

interface RecentTransactionsListProps {
  transactions: PaymentItem[];
  onViewStudentStatement: (userId: string) => void;
  onViewAllPayments?: () => void;
}

export const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({
  transactions,
  onViewStudentStatement,
  onViewAllPayments
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Recent Payment Transactions
              </h3>
              <p className="text-[11px] text-slate-400">
                Latest successfully received fee installments
              </p>
            </div>
          </div>

          {onViewAllPayments && (
            <button
              type="button"
              onClick={onViewAllPayments}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No payment transactions recorded yet. Record your first payment above.
            </div>
          ) : (
            transactions.map((tx) => {
              const isCompleted = tx.status === 'Completed';

              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 hover:border-slate-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>

                    <div>
                      <p className="font-bold text-slate-900 leading-tight">
                        {tx.studentName}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {tx.planName} · <span className="font-mono">{tx.paymentMethod}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Ref: {tx.transactionId || tx.id}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-extrabold text-sm text-slate-900 block">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {tx.paymentDate}
                    </span>
                    <button
                      type="button"
                      onClick={() => onViewStudentStatement(tx.userId)}
                      className="mt-1 text-[10px] font-semibold text-emerald-700 hover:underline flex items-center gap-0.5 justify-end cursor-pointer"
                      title="View Member Fee Statement"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Statement</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        All financial records are verified and persisted in MySQL database.
      </div>
    </div>
  );
};
