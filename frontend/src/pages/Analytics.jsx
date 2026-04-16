import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, Area, AreaChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart
} from 'recharts';
import {
  getAnalyticsForecast, getAnalyticsGrowth, getAnalyticsWinLoss,
  getAnalyticsDealSize, getAnalyticsHeatmap, getAnalyticsCycleLength
} from '../api/axios';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-slate-600">
          {p.name}: <span className="font-bold" style={{ color: p.color }}>
            {typeof p.value === 'number' && p.dataKey.includes('revenue') || p.dataKey === 'avgDealSize'
              ? `$${p.value?.toLocaleString()}`
              : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [forecast, setForecast] = useState({ historical: [], forecast: [] });
  const [growth, setGrowth] = useState([]);
  const [winLoss, setWinLoss] = useState([]);
  const [dealSize, setDealSize] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [cycleLength, setCycleLength] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [f, g, w, d, h, c] = await Promise.allSettled([
          getAnalyticsForecast(), getAnalyticsGrowth(), getAnalyticsWinLoss(),
          getAnalyticsDealSize(), getAnalyticsHeatmap(), getAnalyticsCycleLength(),
        ]);
        if (f.status === 'fulfilled') setForecast(f.value.data);
        if (g.status === 'fulfilled') setGrowth(g.value.data);
        if (w.status === 'fulfilled') setWinLoss(w.value.data);
        if (d.status === 'fulfilled') setDealSize(d.value.data);
        if (h.status === 'fulfilled') setHeatmap(h.value.data);
        if (c.status === 'fulfilled') setCycleLength(c.value.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const forecastData = [
    ...forecast.historical,
    ...forecast.forecast,
  ];

  const Skeleton = () => <div className="h-56 bg-slate-50 rounded-xl animate-pulse" />;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-800">Advanced Analytics</h2>
        <p className="text-sm text-slate-400 mt-0.5">Forecasting, trends, and deep-dive analysis</p>
      </div>

      {/* Revenue Forecast */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-primary-600" />
          <h3 className="font-semibold text-slate-800">Revenue Forecast (Next 3 Months)</h3>
        </div>
        {loading ? <Skeleton /> : (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={52} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4,4,0,0]} maxBarSize={36} opacity={0.9} />
              <Line dataKey="revenue" name="Trend" stroke="#22c55e" strokeWidth={2} strokeDasharray={d => d?.type === 'forecast' ? '5 5' : '0'} dot={(props) => {
                const isForecast = forecastData[props.index]?.type === 'forecast';
                return <circle cx={props.cx} cy={props.cy} r={isForecast ? 5 : 3} fill={isForecast ? '#f97316' : '#22c55e'} stroke="white" strokeWidth={2} />;
              }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Growth + Win/Loss Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* MoM Growth */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Month-over-Month Growth</h3>
          {loading ? <Skeleton /> : (
            <div className="space-y-2">
              {growth.map((g) => (
                <div key={g.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-600">{g.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-800">${g.revenue?.toLocaleString()}</span>
                    {g.growth !== null && (
                      <span className={`flex items-center gap-0.5 text-xs font-semibold ${g.growth > 0 ? 'text-emerald-600' : g.growth < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                        {g.growth > 0 ? <TrendingUp size={12} /> : g.growth < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                        {g.growth > 0 ? '+' : ''}{g.growth}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Win/Loss */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Win/Loss Ratio</h3>
          {loading ? <Skeleton /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={winLoss}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="closed" name="Won" fill="#22c55e" radius={[3,3,0,0]} maxBarSize={28} />
                <Bar dataKey="open" name="Open" fill="#94a3b8" radius={[3,3,0,0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Deal Size + Cycle Length Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Average Deal Size Trend</h3>
          {loading ? <Skeleton /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dealSize}>
                <defs>
                  <linearGradient id="dealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={44} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="avgDealSize" name="Avg Deal Size" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#dealGrad)" dot={{ fill: '#8b5cf6', r: 3.5, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Sales Cycle Length (Avg Days to Close)</h3>
          {loading ? <Skeleton /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cycleLength}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip formatter={(v) => [`${v} days`, 'Avg Cycle']} />
                <Bar dataKey="avgDays" name="Avg Days" fill="#f97316" radius={[4,4,0,0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Heatmap */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-4">Sales Activity Heatmap (By Day of Week)</h3>
        {loading ? <Skeleton /> : (
          <div className="grid grid-cols-7 gap-2">
            {heatmap.map((d) => {
              const maxTotal = Math.max(...heatmap.map((h) => h.total), 1);
              const intensity = d.total / maxTotal;
              const bg = intensity > 0.75 ? 'bg-primary-600 text-white' : intensity > 0.5 ? 'bg-primary-400 text-white' : intensity > 0.25 ? 'bg-primary-200 text-primary-800' : 'bg-primary-50 text-primary-600';
              return (
                <div key={d.day} className={`rounded-xl p-4 text-center ${bg} transition-all`}>
                  <p className="text-xs font-bold uppercase">{d.day}</p>
                  <p className="text-2xl font-display font-bold mt-1">{d.total}</p>
                  <p className="text-xs mt-0.5 opacity-80">{d.closed} closed</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
