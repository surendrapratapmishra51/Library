import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLibrary } from '../../../context/LibraryContext';
import { paymentApi, FeesSummaryResponse, PaymentItem } from '../../../services/paymentApi';
import { FeesFilterBar, FeesFilterValues } from '../../../components/admin/FeesManagement/FeesFilterBar';
import { FeesSummaryCards } from '../../../components/admin/FeesManagement/FeesSummaryCards';
import { FeesCharts } from '../../../components/admin/FeesManagement/FeesCharts';
import { QuickActionsBar } from '../../../components/admin/FeesManagement/QuickActionsBar';
import { StudentFeeLedger } from '../../../components/admin/FeesManagement/StudentFeeLedger';
import { RecentTransactionsList } from '../../../components/admin/FeesManagement/RecentTransactionsList';
import { RecordPaymentModal } from '../../../components/admin/FeesManagement/RecordPaymentModal';
import { ManageDiscountModal } from '../../../components/admin/FeesManagement/ManageDiscountModal';
import { FeeStatementModal } from '../../../components/admin/FeesManagement/FeeStatementModal';
import { PendingDuesModal } from '../../../components/admin/FeesManagement/PendingDuesModal';
import { AdminUser } from '../../../types';
import { AlertCircle, Receipt, CheckCircle2 } from 'lucide-react';

export const ManageFees: React.FC = () => {
  const { users, plans, refreshUsers } = useLibrary();

  // Initial Default Filter: This Month + All Users + All Plans
  const defaultFilterValues = useMemo<FeesFilterValues>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const fromDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const toDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return {
      datePreset: 'this-month',
      fromDate,
      toDate,
      userId: 'all',
      planId: 'all'
    };
  }, []);

  const [filters, setFilters] = useState<FeesFilterValues>(defaultFilterValues);

  // Summary State from MySQL backend
  const [feesData, setFeesData] = useState<FeesSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [isDuesModalOpen, setIsDuesModalOpen] = useState(false);

  // Selected student for modals
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<AdminUser | null>(null);
  const [statementUserId, setStatementUserId] = useState<string | null>(null);

  // Ledger Filter pre-triggers from summary cards
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState<string>('all');
  const [ledgerDuesOnly, setLedgerDuesOnly] = useState<boolean>(false);

  // Fetch summary from backend with active filters
  const fetchSummary = useCallback(async (currentFilters: FeesFilterValues, showIndicator = true) => {
    if (showIndicator) setIsRefreshing(true);
    setErrorMsg(null);
    try {
      const data = await paymentApi.getFeesSummary({
        fromDate: currentFilters.fromDate || undefined,
        toDate: currentFilters.toDate || undefined,
        userId: currentFilters.userId !== 'all' ? currentFilters.userId : undefined,
        planId: currentFilters.planId !== 'all' ? currentFilters.planId : undefined,
      });
      setFeesData(data);
    } catch (err: any) {
      console.error('[ManageFees.fetchSummary] Error:', err);
      setErrorMsg(err?.data?.error || err?.message || 'Failed to fetch fees data from database.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary(filters, true);
  }, [filters, fetchSummary]);

  // Handle Apply from Filter Bar
  const handleApplyFilters = (newFilters: FeesFilterValues) => {
    setFilters(newFilters);
  };

  // Handle Refresh All Data
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      fetchSummary(filters, false),
      refreshUsers(),
    ]);
    setIsRefreshing(false);
  };

  // Record Payment Trigger
  const handleOpenRecordPayment = (user?: AdminUser) => {
    setSelectedStudentForAction(user || null);
    setIsPaymentModalOpen(true);
  };

  // Manage Discount Trigger
  const handleOpenManageDiscount = (user?: AdminUser) => {
    setSelectedStudentForAction(user || null);
    setIsDiscountModalOpen(true);
  };

  // View Statement Trigger
  const handleOpenStatement = (userOrId: AdminUser | string) => {
    if (typeof userOrId === 'string') {
      setStatementUserId(userOrId);
    } else {
      setStatementUserId(userOrId.id);
    }
    setIsStatementModalOpen(true);
  };

  // Actions Success Callbacks
  const handlePaymentSuccess = () => {
    setSuccessToast('Payment successfully recorded and database updated.');
    setTimeout(() => setSuccessToast(null), 4000);
    handleRefreshAll();
  };

  const handleDiscountSuccess = () => {
    setSuccessToast('Discount and fee balance successfully recalculated.');
    setTimeout(() => setSuccessToast(null), 4000);
    handleRefreshAll();
  };

  // Filtered members for Ledger and CSV export based on active filters
  const filteredStudentList = useMemo(() => {
    return users.filter((u) => {
      if (u.role === 'admin') return false;
      if (filters.userId !== 'all' && u.id !== filters.userId) return false;
      if (filters.planId !== 'all' && u.planId !== filters.planId && u.plan !== filters.planId) return false;
      if (filters.toDate && u.joiningDate && u.joiningDate > filters.toDate) return false;
      return true;
    });
  }, [users, filters]);

  // Export Full Ledger matching active filters to CSV
  const handleExportLedgerCSV = () => {
    const headers = [
      'Student Name',
      'Member ID',
      'Mobile',
      'Assigned Desk',
      'Membership Plan',
      'Standard Fee (INR)',
      'Discount (INR)',
      'Discount Reason',
      'Final Payable (INR)',
      'Amount Received (INR)',
      'Balance Due (INR)',
      'Payment Status',
      'Membership Start Date',
      'Membership Expiry Date'
    ];

    const rows = filteredStudentList.map((u) => {
      const bFee = Number(u.baseFee) || 0;
      const disc = Number(u.discount) || 0;
      const fFee = Number(u.finalFee) || Math.max(0, bFee - disc);
      const pAmount = Number(u.paidAmount) || 0;
      const bDue = Number(u.balanceDue) || Math.max(0, fFee - pAmount);
      const pStatus = (u.paymentStatus === 'Pending' || !u.paymentStatus) ? 'Unpaid' : u.paymentStatus;

      return [
        `"${u.name.replace(/"/g, '""')}"`,
        `"${u.id}"`,
        `"${u.mobile || ''}"`,
        `"${u.seat || 'None'}"`,
        `"${u.plan || 'Plan'}"`,
        bFee,
        disc,
        `"${(u.discountReason || '').replace(/"/g, '""')}"`,
        fFee,
        pAmount,
        bDue,
        `"${pStatus}"`,
        `"${u.joiningDate || ''}"`,
        `"${u.expiryDate || ''}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fee_ledger_${filters.datePreset}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fallback summary while loading or if data not yet returned
  const defaultSummary = {
    totalFeesDue: filteredStudentList.reduce((sum, u) => sum + (Number(u.balanceDue) || 0), 0),
    amountCollected: filteredStudentList.reduce((sum, u) => sum + (Number(u.paidAmount) || 0), 0),
    pendingDuesCount: filteredStudentList.filter((u) => (Number(u.balanceDue) || 0) > 0).length,
    pendingDuesAmount: filteredStudentList.reduce((sum, u) => sum + (Number(u.balanceDue) || 0), 0),
    totalDiscounts: filteredStudentList.reduce((sum, u) => sum + (Number(u.discount) || 0), 0),
    totalStudents: filteredStudentList.length,
    statusCounts: {
      paid: filteredStudentList.filter((u) => (Number(u.balanceDue) || 0) === 0).length,
      partial: filteredStudentList.filter((u) => (Number(u.paidAmount) || 0) > 0 && (Number(u.balanceDue) || 0) > 0).length,
      unpaid: filteredStudentList.filter((u) => (Number(u.paidAmount) || 0) === 0 && (Number(u.finalFee) || 0) > 0).length,
    }
  };

  const activeSummary = feesData?.summary || defaultSummary;
  const monthlyCollections = feesData?.monthlyCollections || [];
  const dailyCollections = feesData?.dailyCollections || [];
  const recentTransactions = feesData?.recentTransactions || [];

  const isSingleDay = Boolean(filters.fromDate && filters.toDate && filters.fromDate === filters.toDate);
  const activeFilterLabel = `${filters.datePreset.toUpperCase()}${filters.userId !== 'all' ? ` · User: ${filters.userId}` : ''}${filters.planId !== 'all' ? ` · Plan: ${filters.planId}` : ''}`;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSuccessToast(null)} 
            className="text-emerald-700 hover:text-emerald-950 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setErrorMsg(null)} 
            className="text-rose-700 hover:text-rose-950 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Dynamic Filter Bar Above Summary Cards */}
      <FeesFilterBar
        users={users}
        plans={plans}
        initialFilters={filters}
        onApplyFilters={handleApplyFilters}
        isLoading={isRefreshing}
      />

      {/* 2. Dynamic Summary Cards */}
      <FeesSummaryCards
        summary={activeSummary}
        onFilterDues={() => {
          setLedgerDuesOnly(true);
          setLedgerStatusFilter('all');
        }}
        onFilterStatus={(st) => {
          setLedgerStatusFilter(st);
          setLedgerDuesOnly(false);
        }}
      />

      {/* 3. Quick Actions Bar */}
      <QuickActionsBar
        onOpenRecordPayment={() => handleOpenRecordPayment()}
        onOpenPendingDues={() => setIsDuesModalOpen(true)}
        onOpenManageDiscount={() => handleOpenManageDiscount()}
        onExportCSV={handleExportLedgerCSV}
        onRefresh={handleRefreshAll}
        isRefreshing={isRefreshing}
      />

      {/* 4. Charts: Monthly Collections & Status Distribution */}
      <FeesCharts
        monthlyCollections={monthlyCollections}
        dailyCollections={dailyCollections}
        statusCounts={activeSummary.statusCounts}
        totalStudents={activeSummary.totalStudents}
        isSingleDay={isSingleDay}
        activeFilterLabel={activeFilterLabel}
        onStatusClick={(st) => {
          setLedgerStatusFilter(st);
          setLedgerDuesOnly(false);
        }}
      />

      {/* 5. Student Fee Ledger */}
      <StudentFeeLedger
        users={users}
        plans={plans}
        onRecordPayment={(u) => handleOpenRecordPayment(u)}
        onManageDiscount={(u) => handleOpenManageDiscount(u)}
        onViewStatement={(u) => handleOpenStatement(u)}
        initialFilterStatus={ledgerStatusFilter}
        initialFilterDuesOnly={ledgerDuesOnly}
        appliedUserId={filters.userId}
        appliedPlanId={filters.planId}
        appliedFromDate={filters.fromDate}
        appliedToDate={filters.toDate}
      />

      {/* 6. Recent Payment Transactions */}
      <RecentTransactionsList
        transactions={recentTransactions}
        onViewStudentStatement={(uid) => handleOpenStatement(uid)}
        onViewAllPayments={() => {
          window.scrollTo({ top: 800, behavior: 'smooth' });
        }}
      />

      {/* Modals */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        selectedUser={selectedStudentForAction}
        users={users}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <ManageDiscountModal
        isOpen={isDiscountModalOpen}
        selectedUser={selectedStudentForAction}
        users={users}
        onClose={() => setIsDiscountModalOpen(false)}
        onDiscountSuccess={handleDiscountSuccess}
      />

      <FeeStatementModal
        isOpen={isStatementModalOpen}
        userId={statementUserId}
        onClose={() => setIsStatementModalOpen(false)}
      />

      <PendingDuesModal
        isOpen={isDuesModalOpen}
        users={filteredStudentList}
        onClose={() => setIsDuesModalOpen(false)}
        onCollectPayment={(u) => handleOpenRecordPayment(u)}
      />
    </div>
  );
};

export default ManageFees;
