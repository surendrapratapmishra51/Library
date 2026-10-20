import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Armchair, 
  ExternalLink, 
  LogOut, 
  ShieldCheck,
  Building2,
  Receipt,
  X
} from 'lucide-react';
import { useLibrary } from '../../../context/LibraryContext';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen = false, onClose }) => {
  const { logout, stats, floors } = useLibrary();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      exact: true,
      icon: LayoutDashboard,
      badge: null
    },
    {
      name: 'Fees Management',
      path: '/admin/fees',
      exact: false,
      icon: Receipt,
      badge: stats.pendingDuesCount > 0 ? `${stats.pendingDuesCount} Dues` : null
    },
    {
      name: 'Manage Users',
      path: '/admin/users',
      exact: false,
      icon: Users,
      badge: stats.activeMembers
    },
    {
      name: 'Manage Floors',
      path: '/admin/floors',
      exact: false,
      icon: Building2,
      badge: `${(floors || []).length} Floors`
    },
    {
      name: 'Manage Seats & Plans',
      path: '/admin/seats-plans',
      exact: false,
      icon: Armchair,
      badge: `${stats.availableSeats} Open`
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white text-slate-700 flex flex-col justify-between border-r border-slate-200 shadow-xs transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand / Library Info Header */}
        <div>
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg font-display shadow-xs">
                F
              </div>
              <div>
                <span className="font-bold text-slate-900 text-base tracking-tight font-display block leading-tight">
                  FocusZone
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  Admin Console
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Branch Marker */}
          <div className="mx-4 my-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-slate-900 font-semibold mb-0.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Civil Lines Branch</span>
            </div>
            <p className="text-[11px] text-slate-500">
              100 Desks · Floors 1 & 2
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1.5">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Main Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.exact}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.name}</span>
                      </div>

                      {item.badge !== null && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold ${
                            isActive
                              ? 'bg-emerald-700/60 text-white border border-emerald-500/60'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 space-y-1.5">
          {/* Quick link to live student/public site */}
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Site</span>
            </span>
            <span className="text-[10px] text-slate-400">↗</span>
          </Link>

          {/* Sign Out */}
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
