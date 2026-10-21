import React, { useState } from 'react';
import { BarChart3, PieChart, Calendar, ChevronRight, TrendingUp } from 'lucide-react';
import { MonthlyCollectionItem, DailyCollectionItem } from '../../../services/paymentApi';

interface FeesChartsProps {
  monthlyCollections: MonthlyCollectionItem[];
  dailyCollections?: DailyCollectionItem[];
  statusCounts: {
    paid: number;
    partial: number;
    unpaid: number;
  };
  totalStudents: number;
  isSingleDay?: boolean;
  activeFilterLabel?: string;
  onStatusClick?: (status: 'Paid' | 'Partial' | 'Unpaid') => void;
}

export const FeesCharts: React.FC<FeesChartsProps> = ({
  monthlyCollections,
  dailyCollections = [],
  statusCounts,
  totalStudents,
  isSingleDay = false,
  activeFilterLabel,
  onStatusClick
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; amount: number; count: number } | null>(null);

  // Decide whether to show daily bars or monthly bars
  const useDailyView = isSingleDay || (dailyCollections.length > 0 && dailyCollections.length <= 15);
  const chartItems = useDailyView
    ? dailyCollections.map((d) => ({ key: d.date, label: d.label, amount: d.amount, count: d.count }))
    : monthlyCollections.map((m) => ({ key: m.month, label: m.label, amount: m.amount, count: m.count }));

  const maxCollection = Math.max(1000, ...chartItems.map((c) => c.amount));

  const totalEvaluated = (statusCounts.paid + statusCounts.partial + statusCounts.unpaid) || 1;
  const paidPct = Math.round((statusCounts.paid / totalEvaluated) * 100);
  const partialPct = Math.round((statusCounts.partial / totalEvaluated) * 100);
  const unpaidPct = 100 - paidPct - partialPct;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Fee Collection Chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  {useDailyView ? 'Daily Fee Collection Trend' : 'Monthly Fee Collections'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {activeFilterLabel ? `Filtered view: ${activeFilterLabel}` : 'Total successfully received payments over time'}
                </p>
              </div>
            </div>

            <div className="text-xs font-semibold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 self-start sm:self-auto">
              {useDailyView ? 'Daily Resolution' : 'Monthly Resolution'}
            </div>
          </div>

          {/* SVG / Bar Chart Visualization */}
          <div className="relative pt-6 pb-2">
            {hoveredPoint && (
              <div className="absolute top-0 right-4 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs shadow-md z-10 flex items-center gap-2">
                <span className="font-semibold text-emerald-300 font-mono">
                  ₹{hoveredPoint.amount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-300">
                  ({hoveredPoint.count} payment{hoveredPoint.count === 1 ? '' : 's'})
                </span>
              </div>
            )}

            <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-200">
              {chartItems.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                  No payment collections recorded in this date range.
                </div>
              ) : (
                chartItems.map((item) => {
                  const heightPercent = maxCollection > 0
                    ? Math.max(6, Math.round((item.amount / maxCollection) * 100))
                    : 6;

                  const isZero = item.amount === 0;

                  return (
                    <div
                      key={item.key}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(item)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <div className="w-full max-w-[48px] flex flex-col items-center justify-end h-full">
                        <span className="text-[9px] font-mono text-slate-400 mb-1 group-hover:text-emerald-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          ₹{item.amount >= 1000 ? `${(item.amount / 1000).toFixed(1)}k` : item.amount}
                        </span>

                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            isZero
                              ? 'bg-slate-200 group-hover:bg-slate-300'
                              : 'bg-linear-to-t from-sky-600 to-emerald-500 group-hover:from-sky-700 group-hover:to-emerald-600 shadow-xs'
                          }`}
                        />
                      </div>

                      <span className="text-[10px] font-medium text-slate-500 mt-2 truncate max-w-[70px] text-center">
                        {item.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-linear-to-r from-sky-600 to-emerald-500 inline-block" />
            <span>Successful Payments Collected</span>
          </div>
          <span className="font-mono font-medium text-slate-600">
            Peak: ₹{maxCollection.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* 2. Payment Status Distribution Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-6">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Payment Status Breakdown
              </h3>
              <p className="text-[11px] text-slate-400">
                Filtered members status distribution
              </p>
            </div>
          </div>

          <div className="space-y-4 my-2">
            {/* Multi-segment Progress Bar */}
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${paidPct}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Paid: ${statusCounts.paid} (${paidPct}%)`}
              />
              <div
                style={{ width: `${partialPct}%` }}
                className="bg-amber-500 transition-all duration-500"
                title={`Partial: ${statusCounts.partial} (${partialPct}%)`}
              />
              <div
                style={{ width: `${unpaidPct}%` }}
                className="bg-rose-500 transition-all duration-500"
                title={`Unpaid: ${statusCounts.unpaid} (${unpaidPct}%)`}
              />
            </div>

            {/* Status Breakdown Legend & Interactive Cards */}
            <div className="space-y-2.5 pt-2">
              <div
                onClick={() => onStatusClick && onStatusClick('Paid')}
                className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs cursor-pointer hover:bg-emerald-100/60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                  <div>
                    <span className="font-bold text-emerald-950 block">Fully Paid</span>
                    <span className="text-[10px] text-emerald-700">Zero dues remaining</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-emerald-900 block">
                    {statusCounts.paid}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 font-mono">
                    {paidPct}%
                  </span>
                </div>
              </div>

              <div
                onClick={() => onStatusClick && onStatusClick('Partial')}
                className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between text-xs cursor-pointer hover:bg-amber-100/60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-100" />
                  <div>
                    <span className="font-bold text-amber-950 block">Partially Paid</span>
                    <span className="text-[10px] text-amber-700">Installment in progress</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-amber-900 block">
                    {statusCounts.partial}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 font-mono">
                    {partialPct}%
                  </span>
                </div>
              </div>

              <div
                onClick={() => onStatusClick && onStatusClick('Unpaid')}
                className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-between text-xs cursor-pointer hover:bg-rose-100/60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-100" />
                  <div>
                    <span className="font-bold text-rose-950 block">Unpaid</span>
                    <span className="text-[10px] text-rose-700">No payment collected yet</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-rose-900 block">
                    {statusCounts.unpaid}
                  </span>
                  <span className="text-[10px] font-semibold text-rose-700 font-mono">
                    {unpaidPct}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
          Total student base in scope: <strong className="text-slate-800">{totalStudents}</strong>
        </div>
      </div>
    </div>
  );
};
