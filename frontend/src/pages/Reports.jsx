import { useState, useEffect, useCallback } from 'react';
import { Download, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from 'recharts';
import Filters from '../components/Filters';
import { useFilters } from '../context/FilterContext';
import { getDashboardTrend, getDashboardLeaderboard, getEmployeePerformance, getExportData, getEmployees } from '../api/axios';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-slate-600">
          {p.name}: <span className="font-bold" style={{ color: p.color }}>
            {p.name === 'Revenue' ? `$${p.value?.toLocaleString()}` : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

function exportToCSV(data) {
  if (!data?.length) return;
  const headers = ['Date', 'Employee', 'Role', 'Team', 'Client', 'Product', 'Amount', 'Status'];
  const rows = data.map(r => [
    new Date(r.date).toLocaleDateString(),
    r.employeeId?.name || '',
    r.employeeId?.role || '',
    r.employeeId?.team || '',
    r.clientName,
    r.product,
    r.amount,
    r.status,
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sales-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const { filters } = useFilters();
  const [trend, setTrend] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [trendRes, boardRes, perfRes, empRes] = await Promise.all([
        getDashboardTrend({ period: filters.period }),
        getDashboardLeaderboard({ period: filters.period }),
        getEmployeePerformance({ period: filters.period, team: filters.team }),
        getEmployees(),
      ]);
      setTrend(trendRes.data);
      setLeaderboard(boardRes.data);
      setPerformance(perfRes.data);
      setEmployees(empRes.data.employees);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters.period, filters.team]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await getExportData({ period: filters.period });
      exportToCSV(res.data);
    } catch (err) { console.error(err); }
    finally { setExporting(false); }
  };

  // Radar data: top 6 employees
  const radarData = performance.slice(0, 6).map(e => ({
    name: e.name.split(' ')[0],
    Revenue: Math.round(e.revenue / 1000),
    Deals: e.dealsClosed,
    'Conv. %': e.conversionRate,
  }));

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-800">Reports & Analytics</h2>
          <p className="text-sm text-slate-400 mt-0.5">Deep-dive performance analysis</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Filters employees={employees} showEmployee={false} />
          <button onClick={handleExport} disabled={exporting} className="btn-primary">
            <Download size={14} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Revenue by period */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-primary-600" />
          <h3 className="font-semibold text-slate-800">Revenue Over Time</h3>
        </div>
        {loading ? (
          <div className="h-64 bg-slate-50 rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} width={52} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[5, 5, 0, 0]} maxBarSize={40} />
              <Bar dataKey="deals" name="Deals" fill="#22c55e" radius={[5, 5, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Two charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leaderboard bar */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Top Performers by Revenue</h3>
          {loading ? (
            <div className="h-52 bg-slate-50 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={leaderboard.slice(0, 8)} layout="vertical" margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip formatter={v => [`$${v?.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Radar */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Employee Comparison (Radar)</h3>
          {loading || !radarData.length ? (
            <div className="h-52 bg-slate-50 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <PolarRadiusAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Radar name="Revenue (K)" dataKey="Revenue" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Deals" dataKey="Deals" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={2} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Summary table */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-4">Full Performance Report</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Employee', 'Team', 'Revenue', 'Deals', 'Leads', 'Conv. %', 'Target %'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading
                ? [...Array(6)].map((_, i) => <tr key={i}><td colSpan={7} className="py-2 px-4"><div className="h-5 bg-slate-100 rounded animate-pulse" /></td></tr>)
                : performance.map(emp => (
                  <tr key={emp._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">{emp.name}</td>
                    <td className="py-3 px-4 text-slate-500">{emp.team}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">${emp.revenue?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-700">{emp.dealsClosed}</td>
                    <td className="py-3 px-4 text-slate-600">{emp.leadsAssigned}</td>
                    <td className="py-3 px-4 text-slate-700">{emp.conversionRate}%</td>
                    <td className={`py-3 px-4 font-semibold ${emp.targetAchievement >= 100 ? 'text-emerald-600' : emp.targetAchievement >= 75 ? 'text-blue-600' : 'text-amber-600'}`}>
                      {emp.targetAchievement}%
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
