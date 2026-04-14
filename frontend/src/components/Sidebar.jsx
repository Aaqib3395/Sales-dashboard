import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, BarChart3, TrendingUp,
  Settings, ChevronRight, Zap, HeadphonesIcon
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employees', icon: Users, label: 'Employees' },
  { to: '/pipeline', icon: TrendingUp, label: 'Pipeline' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside
      className={`sidebar fixed left-0 top-0 h-full bg-white border-r border-slate-100 flex flex-col z-40 transition-all duration-300 overflow-y-auto ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-100 flex-shrink-0">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" fill="white" />
        </div>
        {!collapsed && (
          <span className="font-display font-700 text-slate-800 text-lg tracking-tight">
            FlowTech
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-slate-400 hover:text-slate-600 transition-colors"
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
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''} mt-2`
          }
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={18} className="flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </nav>

      {/* Help desk */}
      {!collapsed && (
        <div className="mx-3 mb-4 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-600 p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <HeadphonesIcon size={16} />
            <span className="text-sm font-semibold">Help Desk</span>
          </div>
          <p className="text-xs text-primary-100 mb-3">Need support? Our team is here 24/7</p>
          <button className="w-full bg-white text-primary-700 rounded-lg py-1.5 text-xs font-semibold hover:bg-primary-50 transition-colors">
            Contact Support
          </button>
        </div>
      )}
    </aside>
  );
}
