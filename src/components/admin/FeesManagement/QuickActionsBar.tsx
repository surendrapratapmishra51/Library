import React from 'react';
import { PlusCircle, AlertTriangle, Tag, Download, RefreshCw, FileText } from 'lucide-react';
import { Button } from '../../common/Button';

interface QuickActionsBarProps {
  onOpenRecordPayment: () => void;
  onOpenPendingDues: () => void;
  onOpenManageDiscount: () => void;
  onExportCSV: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onOpenRecordPayment,
  onOpenPendingDues,
  onOpenManageDiscount,
  onExportCSV,
  onRefresh,
  isRefreshing = false
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
      {/* Left: Quick Actions Group */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenRecordPayment}
          className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          <span>Record Payment</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenPendingDues}
          className="border-amber-300 text-amber-900 bg-amber-50/60 hover:bg-amber-100/70 font-medium"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
          <span>View Pending Dues</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenManageDiscount}
          className="border-sky-300 text-sky-900 bg-sky-50/60 hover:bg-sky-100/70 font-medium"
        >
          <Tag className="w-3.5 h-3.5 text-sky-600 mr-1.5" />
          <span>Manage Discounts</span>
        </Button>
      </div>

      {/* Right: Export & Refresh */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onExportCSV}
          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export to CSV</span>
        </button>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh Data from MySQL Database"
          aria-label="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>
    </div>
  );
};
