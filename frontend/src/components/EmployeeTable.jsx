import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { useState } from 'react';

function Avatar({ name, size = 'sm' }) {
  const initials = name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['bg-primary-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-500', 'bg-blue-500', 'bg-pink-500'];
  const colorIdx = name ? name.charCodeAt(0) % colors.length : 0;
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sz} rounded-full ${colors[colorIdx]} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
}

function ProgressBar({ value, max = 100 }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = pct >= 100 ? 'bg-emerald-500' : pct >= 75 ? 'bg-blue-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
      <div className={`h-1.5 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function EmployeeTable({ data = [], loading }) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState('revenue');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const sorted = [...data].sort((a, b) => {
    const v = (sortDir === 'asc' ? 1 : -1);
    return (a[sortKey] - b[sortKey]) * v || 0;
  });

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp size={12} className="text-slate-300" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-primary-500" />
      : <ChevronDown size={12} className="text-primary-500" />;
  };

  const indicatorBadge = {
    excellent: <span className="badge-excellent">Excellent</span>,
    good: <span className="badge-good">Good</span>,
    average: <span className="badge-average">Average</span>,
    poor: <span className="badge-poor">Poor</span>,
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-sm">No employees found</p>
      </div>
    );
  }

  const thClass = "text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4 cursor-pointer hover:text-slate-700 select-none";

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr className="border-b border-slate-100">
            <th className={`${thClass} w-12`}>#</th>
            <th className={thClass}>Employee</th>
            <th className={`${thClass}`} onClick={() => handleSort('dealsClosed')}>
              <span className="flex items-center gap-1">Deals <SortIcon col="dealsClosed" /></span>
            </th>
            <th className={thClass} onClick={() => handleSort('revenue')}>
              <span className="flex items-center gap-1">Revenue <SortIcon col="revenue" /></span>
            </th>
            <th className={thClass} onClick={() => handleSort('leadsAssigned')}>
              <span className="flex items-center gap-1">Leads <SortIcon col="leadsAssigned" /></span>
            </th>
            <th className={thClass} onClick={() => handleSort('conversionRate')}>
              <span className="flex items-center gap-1">Conv. % <SortIcon col="conversionRate" /></span>
            </th>
            <th className={thClass}>Target</th>
            <th className={thClass}>Performance</th>
            <th className={thClass}></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {sorted.map((emp, idx) => (
            <tr
              key={emp._id}
              className="hover:bg-slate-50 transition-colors group"
            >
              <td className="py-3 px-4 text-sm text-slate-400 font-medium">{idx + 1}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <Avatar name={emp.name} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{emp.name}</p>
                    <p className="text-xs text-slate-400">{emp.role}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-sm font-semibold text-slate-700">{emp.dealsClosed}</td>
              <td className="py-3 px-4">
                <p className="text-sm font-semibold text-slate-800">
                  ${emp.revenue?.toLocaleString()}
                </p>
              </td>
              <td className="py-3 px-4 text-sm text-slate-600">{emp.leadsAssigned}</td>
              <td className="py-3 px-4 text-sm font-medium text-slate-700">{emp.conversionRate}%</td>
              <td className="py-3 px-4 min-w-[120px]">
                <p className="text-xs text-slate-500">{emp.targetAchievement}%</p>
                <ProgressBar value={emp.targetAchievement} max={100} />
              </td>
              <td className="py-3 px-4">{indicatorBadge[emp.indicator]}</td>
              <td className="py-3 px-4">
                <button
                  onClick={() => navigate(`/employees/${emp._id}`)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary-600"
                  title="View details"
                >
                  <ExternalLink size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
