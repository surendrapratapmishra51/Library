import React from 'react';
import { IndianRupee, ArrowDownRight, Clock, Tag, TrendingUp, AlertTriangle } from 'lucide-react';

interface FeesSummaryCardsProps {
  summary: {
    totalFeesDue: number;
    amountCollected: number;
    pendingDuesCount: number;
    pendingDuesAmount: number;
    totalDiscounts: number;
    totalStudents: number;
    statusCounts: {
      paid: number;
      partial: number;
      unpaid: number;
    };
  };
  onFilterDues?: () => void;
  onFilterStatus?: (status: 'Paid' | 'Partial' | 'Unpaid') => void;
}

export const FeesSummaryCards: React.FC<FeesSummaryCardsProps> = ({
  summary,
  onFilterDues,
  onFilterStatus
}) => {
  const collectionRate = (summary.amountCollected + summary.totalFeesDue) > 0
    ? Math.round((summary.amountCollected / (summary.amountCollected + summary.totalFeesDue)) * 100)
    : 0;

  const cards = [
    {
      id: 'total-collected',
      title: 'Amount Collected',
      value: `₹${summary.amountCollected.toLocaleString('en-IN')}`,
      subtitle: `${collectionRate}% of total payable realized`,
      icon: TrendingUp,
      accent: 'emerald',
      bgColor: 'bg-emerald-50/80 border-emerald-200/90 text-emerald-800',
      iconBg: 'bg-emerald-600 text-white',
      badge: `${summary.statusCounts.paid} Fully Paid`,
      onClick: () => onFilterStatus && onFilterStatus('Paid')
    },
    {
      id: 'pending-dues',
      title: 'Total Pending Dues',
      value: `₹${summary.totalFeesDue.toLocaleString('en-IN')}`,
      subtitle: `${summary.pendingDuesCount} student${summary.pendingDuesCount === 1 ? '' : 's'} with unpaid balances`,
      icon: AlertTriangle,
      accent: 'amber',
      bgColor: 'bg-amber-50/80 border-amber-200/90 text-amber-900',
      iconBg: 'bg-amber-600 text-white',
      badge: `${summary.statusCounts.partial} Partial · ${summary.statusCounts.unpaid} Unpaid`,
      onClick: () => onFilterDues && onFilterDues()
    },
    {
      id: 'active-dues-count',
      title: 'Members with Dues',
      value: summary.pendingDuesCount.toString(),
      subtitle: `Out of ${summary.totalStudents} registered students`,
      icon: Clock,
      accent: 'rose',
      bgColor: 'bg-rose-50/80 border-rose-200/90 text-rose-900',
      iconBg: 'bg-rose-600 text-white',
      badge: summary.pendingDuesCount === 0 ? 'Zero Overdue' : 'Action Required',
      onClick: () => onFilterDues && onFilterDues()
    },
    {
      id: 'total-discounts',
      title: 'Discounts Given',
      value: `₹${summary.totalDiscounts.toLocaleString('en-IN')}`,
      subtitle: 'Concessions on membership plans',
      icon: Tag,
      accent: 'sky',
      bgColor: 'bg-sky-50/80 border-sky-200/90 text-sky-900',
      iconBg: 'bg-sky-600 text-white',
      badge: 'Admin Concessions',
      onClick: undefined
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={card.onClick}
            className={`p-5 rounded-2xl border transition-all duration-200 ${
              card.onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
            } bg-white border-slate-200 shadow-xs flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                {card.value}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                <span className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">
                  {card.subtitle}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${card.bgColor}`}>
                  {card.badge}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
