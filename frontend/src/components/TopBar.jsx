import { Search, Sun, Moon, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function TopBar({ title, subtitle, darkMode, toggleDark, onRefresh }) {
  const { user } = useAuth();
  const [searchVal, setSearchVal] = useState('');

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center px-6 gap-4 sticky top-0 z-30">
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="font-display font-semibold text-slate-800 dark:text-white text-xl leading-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl w-56 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all text-slate-700 dark:text-slate-200 placeholder-slate-400"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={15} />
          </button>
        )}

        <button
          onClick={toggleDark}
          className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          title="Toggle dark mode"
        >
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <NotificationBell />

        {/* Avatar */}
        <div className="flex items-center gap-2 ml-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer" title={user?.name}>
            {initials}
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-400">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
