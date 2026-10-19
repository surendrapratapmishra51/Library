import React from 'react';
import { 
  Users, 
  UserCheck, 
  Armchair, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  UserMinus, 
  ArrowRightLeft, 
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { useLibrary } from '../../../context/LibraryContext';
import { Link } from 'react-router-dom';

export const DashboardStats: React.FC = () => {
  const { stats, users, activities } = useLibrary();

  // Overview calculations
  const recentlyAdded = users
    .filter((u) => u.status === 'Active')
    .slice(0, 4);

  const recentlyDiscontinued = users
    .filter((u) => u.status === 'Discontinued')
    .slice(0, 4);

  const seatChangeActivities = activities
    .filter((a) => a.type === 'seat_changed' || a.type === 'member_added')
    .slice(0, 4);

  const statCards = [
    {
      title: 'Total Members',
      value: stats.totalMembers,
      subtext: `${stats.activeMembers} Active · ${stats.discontinuedMembers} Past`,
      icon: Users,
      color: 'bg-slate-100 text-slate-800'
    },
    {
      title: 'Active Members',
      value: stats.activeMembers,
      subtext: 'Holding assigned desks',
      icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-700'
    },
    {
      title: 'Total Seats',
      value: stats.totalSeats,
      subtext: 'Floor 1 & Floor 2 capacity',
      icon: Armchair,
      color: 'bg-blue-50 text-blue-700'
    },
    {
      title: 'Available Seats',
      value: stats.availableSeats,
      subtext: 'Ready for new admissions',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      title: 'Occupied Seats',
      value: stats.occupiedSeats,
      subtext: `${Math.round((stats.occupiedSeats / (stats.totalSeats || 1)) * 100)}% occupancy rate`,
      icon: Armchair,
      color: 'bg-rose-50 text-rose-600'
    },
    {
      title: 'Active Plans',
      value: stats.activePlans,
      subtext: 'Published membership packages',
      icon: Calendar,
      color: 'bg-amber-50 text-amber-700'
    }
  ];

  return (
    <div className="space-y-8">
      {/* 6 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  {card.title}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-3xl font-extrabold font-display tabular-nums text-slate-900 tracking-tight">
                  {card.value}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                  {card.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3 Overview Activity Cards: Recently Added, Discontinued, Seat Changes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Overview 1: Recently Added Members */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Recently Added Members
                </h3>
              </div>
              <Link
                to="/admin/users"
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Manage →
              </Link>
            </div>

            <div className="space-y-3">
              {recentlyAdded.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No active members enrolled yet.</p>
              ) : (
                recentlyAdded.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500">{user.mobile} · {user.plan}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {user.seat}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{user.joiningDate}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500 text-center">
            Total active student base: <strong className="text-slate-800">{stats.activeMembers}</strong>
          </div>
        </div>

        {/* Overview 2: Recently Discontinued Members */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                  <UserMinus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Discontinued / Past Members
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Historical Records</span>
            </div>

            <div className="space-y-3">
              {recentlyDiscontinued.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No discontinued members yet.</p>
              ) : (
                recentlyDiscontinued.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-700">{user.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Released Seat: <span className="font-mono font-semibold">{user.previousSeat || 'N/A'}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Discontinued
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{user.discontinuedDate || 'Past date'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500 text-center">
            Released seats are available for new admissions.
          </div>
        </div>

        {/* Overview 3: Recent Seat Assignments & Changes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Recent Seat Assignments
                </h3>
              </div>
              <Link
                to="/admin/seats-plans"
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                Layout Matrix →
              </Link>
            </div>

            <div className="space-y-3">
              {seatChangeActivities.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No seat assignment logs yet.</p>
              ) : (
                seatChangeActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{act.title}</span>
                      <span className="text-[10px] text-slate-400">{act.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      {act.details}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Live Available:</span>
            <span className="font-mono font-bold text-emerald-700">{stats.availableSeats} Desks</span>
          </div>
        </div>

      </div>
    </div>
  );
};
