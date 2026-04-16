import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, BarChart3, TrendingUp,
  Settings, ChevronRight, Zap, HeadphonesIcon,
  LineChart, Building2, Target, Activity, Shield, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employees', icon: Users, label: 'Employees' },
  { to: '/pipeline', icon: TrendingUp, label: 'Pipeline' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/analytics', icon: LineChart, label: 'Analytics' },
  { to: '/clients', icon: Building2, label: 'Clients' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/feed', icon: Activity, label: 'Activity Feed' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout, hasRole } = useAuth();

  return (
    <aside
      className={`sidebar fixed left-0 top-0 h-full bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 flex flex-col z-40 transition-all duration-300 overflow-y-auto ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" fill="white" />
        </div>
        {!collapsed && (
          <span className="font-display font-700 text-slate-800 dark:text-white text-lg tracking-tight">
            FlowTech
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <ChevronRight
            size={16}
            className={`transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-3">
            Main Menu
          </p>
        )}
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {!collapsed && (
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mt-6 mb-3">
            System
          </p>
        )}

        {hasRole('Admin') && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? 'Users' : undefined}
          >
            <Shield size={18} className="flex-shrink-0" />
            {!collapsed && <span>Users</span>}
          </NavLink>
        )}

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''} mt-1`
          }
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={18} className="flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <button
          onClick={logout}
          className={`sidebar-link text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 w-full mt-1 ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </nav>

      {/* User card */}
      {!collapsed && user && (
        <div className="mx-3 mb-4 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-600 p-4 text-white">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              {user.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-[10px] text-primary-200">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
