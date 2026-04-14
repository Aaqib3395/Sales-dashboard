import { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, Target, Zap, TrendingUp, Trophy, RefreshCw
} from 'lucide-react';
import KPICard from '../components/KPICard';
import SalesTrendChart from '../components/SalesTrendChart';
import PipelineDonutChart from '../components/PipelineDonutChart';
import EmployeeTable from '../components/EmployeeTable';
import Filters from '../components/Filters';
import { useFilters } from '../context/FilterContext';
import {
  getDashboardKPIs,
  getDashboardTrend,
  getDashboardPipeline,
  getDashboardLeaderboard,
  getEmployeePerformance,
  getEmployees,
} from '../api/axios';

function Leaderboard({ data = [], loading }) {
  const colors = ['bg-amber-400', 'bg-slate-400', 'bg-orange-700', 'bg-primary-400'];
  if (loading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}</div>;
  return (
    <div className="space-y-2">
      {data.map((emp, i) => (
        <div key={emp._id} className="flex items-center gap-3 py-2">
          <div className={`w-6 h-6 rounded-full ${colors[i] || 'bg-slate-300'} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{emp.name}</p>
            <p className="text-xs text-slate-400">{emp.team}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">${emp.revenue?.toLocaleString()}</p>
            <p className="text-xs text-slate-400">{emp.deals} deals</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { filters } = useFilters();
  const [kpis, setKpis] = useState(null);
  const [trend, setTrend] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState({ kpis: true, trend: true, pipeline: true, board: true, perf: true });
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchAll = useCallback(async () => {
    setLoading({ kpis: true, trend: true, pipeline: true, board: true, perf: true });
    try {
      const [kpiRes, trendRes, pipeRes, boardRes, perfRes, empRes] = await Promise.allSettled([
        getDashboardKPIs({ period: filters.period, team: filters.team, employeeId: filters.employeeId }),
        getDashboardTrend({ period: filters.period }),
        getDashboardPipeline(),
        getDashboardLeaderboard({ period: filters.period }),
        getEmployeePerformance({ period: filters.period, team: filters.team }),
        getEmployees({ team: filters.team }),
      ]);

      if (kpiRes.status === 'fulfilled') setKpis(kpiRes.value.data);
      if (trendRes.status === 'fulfilled') setTrend(trendRes.value.data);
      if (pipeRes.status === 'fulfilled') setPipeline(pipeRes.value.data);
      if (boardRes.status === 'fulfilled') setLeaderboard(boardRes.value.data);
      if (perfRes.status === 'fulfilled') setPerformance(perfRes.value.data);
      if (empRes.status === 'fulfilled') setEmployees(empRes.value.data.employees);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading({ kpis: false, trend: false, pipeline: false, board: false, perf: false });
    }
  }, [filters, refreshKey]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-800">Overview</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Filters employees={employees} />
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="btn-secondary"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Sales"
          value={kpis?.totalSales}
          type="currency"
          change={kpis?.salesGrowth}
          changeLabel="vs last period"
          icon={DollarSign}
          color="indigo"
          delay={0}
        />
        <KPICard
          title="Deals Closed"
          value={kpis?.dealsClosedCount}
          type="number"
          icon={Target}
          color="green"
          delay={100}
        />
        <KPICard
          title="Active Leads"
          value={kpis?.activeLeads}
          type="number"
          icon={Zap}
          color="orange"
          delay={200}
        />
        <KPICard
          title="Conversion Rate"
          value={kpis?.conversionRate}
          type="percent"
          icon={TrendingUp}
          color="violet"
          delay={300}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend Chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Sales Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Revenue & deals over time</p>
            </div>
          </div>
          <SalesTrendChart data={trend} loading={loading.trend} />
        </div>

        {/* Pipeline Donut */}
        <div className="card">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-800 text-base">Pipeline Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Current stage breakdown</p>
          </div>
          <PipelineDonutChart data={pipeline} loading={loading.pipeline} />
        </div>
      </div>

      {/* Performance + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Table */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Employee Performance</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {filters.period === 'weekly' ? 'This week' : 'This month'} · {performance.length} employees
              </p>
            </div>
          </div>
          <EmployeeTable data={performance} loading={loading.perf} />
        </div>

        {/* Leaderboard */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-amber-500" />
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Leaderboard</h3>
              <p className="text-xs text-slate-400">Top performers</p>
            </div>
          </div>
          <Leaderboard data={leaderboard.slice(0, 7)} loading={loading.board} />
        </div>
      </div>
    </div>
  );
}
