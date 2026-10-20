import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/Sidebar/AdminSidebar';
import { Menu, ShieldCheck, UserCheck, Bell } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { stats, isAuthenticated, userRole } = useLibrary();

  // Route Guard: Only authenticated admins can access the Admin Panel
  if (!isAuthenticated || userRole !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  // Section title based on route
  const getSectionTitle = () => {
    if (location.pathname.includes('/fees')) return 'Fees Management';
    if (location.pathname.includes('/users')) return 'Manage Users';
    if (location.pathname.includes('/floors')) return 'Manage Floors';
    if (location.pathname.includes('/seats-plans')) return 'Manage Seats & Plans';
    return 'Admin Dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-800">
      {/* Left Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                {getSectionTitle()}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                FocusZone Digital Study Library · Administrative Management Console
              </p>
            </div>
          </div>

          {/* Right Header Status Badges */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                ● {stats.availableSeats} Desks Open
              </span>
              <span className="font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                {stats.activeMembers} Active Members
              </span>
            </div>

            <div className="flex items-center gap-2 pl-2 sm:border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div className="hidden md:block text-left text-xs">
                <span className="font-bold text-slate-900 block leading-tight">Admin User</span>
                <span className="text-[10px] text-slate-400">Super Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
