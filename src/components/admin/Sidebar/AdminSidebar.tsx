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
  X
} from 'lucide-react';
import { useLibrary } from '../../../context/LibraryContext';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen = false, onClose }) => {
  const { logout, stats } = useLibrary();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      exact: true,
      icon: LayoutDashboard,
      badge: null
    },
    {
      name: 'Manage Users',
      path: '/admin/users',
      exact: false,
      icon: Users,
      badge: stats.activeMembers
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
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-950 text-slate-300 flex flex-col justify-between border-r border-slate-900 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand / Library Info Header */}
        <div>
          <div className="p-5 border-b border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg font-display shadow-sm">
                F
              </div>
              <div>
                <span className="font-bold text-white text-base tracking-tight font-display block leading-tight">
                  FocusZone
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">
                  Admin Console
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Branch Marker */}
          <div className="mx-4 my-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-semibold mb-0.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Civil Lines Branch</span>
            </div>
            <p className="text-[11px] text-slate-400">
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
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>

                  {item.badge !== null && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-emerald-400 border border-slate-800">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-900 space-y-2">
          {/* Quick link to live student/public site */}
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
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
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
