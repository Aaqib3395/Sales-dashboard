import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Target, Calendar } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar
} from 'recharts';
import { getEmployeeStats } from '../api/axios';

const STAGE_COLORS = {
  lead: '#f97316', 'follow-up': '#3b82f6', negotiation: '#8b5cf6', closed: '#22c55e'
};
const STAGE_LABELS = { lead: 'Hot Leads', 'follow-up': 'Follow-ups', negotiation: 'Negotiation', closed: 'Closed' };

function StatChip({ label, value, color = 'indigo' }) {
  const colorMap = {
    indigo: 'bg-primary-50 text-primary-700 border-primary-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
  };
  return (
    <div className={`flex flex-col items-center px-5 py-3 rounded-2xl border ${colorMap[color]}`}>
      <span className="text-xl font-display font-bold">{value}</span>
      <span className="text-xs font-medium mt-0.5 opacity-80">{label}</span>
    </div>
  );
}

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    setLoading(true);
    getEmployeeStats(id, { period })
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id, period]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-40 bg-slate-100 rounded-xl animate-pulse" />
        <div className="card h-40 animate-pulse bg-slate-50" />
        <div className="grid grid-cols-2 gap-4">
          <div className="card h-56 animate-pulse bg-slate-50" />
          <div className="card h-56 animate-pulse bg-slate-50" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-slate-400">
        <p>Employee not found</p>
        <button onClick={() => navigate(-1)} className="btn-secondary mt-4 mx-auto">Back</button>
      </div>
    );
  }

  const { employee: emp, trend, pipeline, recentActivity } = data;

  const totalRevenue = trend.reduce((s, t) => s + t.revenue, 0);
  const totalDeals = trend.reduce((s, t) => s + t.deals, 0);
  const closedPipeline = pipeline.find(p => p._id === 'closed');
  const activePipeline = pipeline.filter(p => p._id !== 'closed').reduce((s, p) => s + p.count, 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft size={16} />
        Back to Employees
      </button>

      {/* Employee card */}
      <div className="card flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-2xl font-display font-bold flex-shrink-0">
          {emp.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1">
          <h2 className="font-display text-xl font-bold text-slate-800">{emp.name}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{emp.role} · {emp.team}</p>
          <div className="flex flex-wrap gap-4 mt-3">
            {emp.email && (
              <a href={`mailto:${emp.email}`} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary-600">
                <Mail size={12} />{emp.email}
              </a>
            )}
            {emp.phone && (
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Phone size={12} />{emp.phone}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar size={12} />Joined {new Date(emp.hireDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        {/* Period toggle */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1 flex-shrink-0">
          {['weekly', 'monthly'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === p ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p === 'weekly' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats chips */}
      <div className="flex flex-wrap gap-3">
        <StatChip label="Total Revenue" value={`$${totalRevenue >= 1000 ? `${(totalRevenue/1000).toFixed(0)}K` : totalRevenue}`} color="indigo" />
        <StatChip label="Deals Closed" value={totalDeals} color="green" />
        <StatChip label="Active Pipeline" value={activePipeline} color="orange" />
        <StatChip label="Monthly Target" value={`$${emp.target >= 1000 ? `${(emp.target/1000).toFixed(0)}K` : emp.target}`} color="violet" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue trend */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Revenue History</h3>
          {trend.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="empGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={40} />
                <Tooltip formatter={v => [`$${v?.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#empGrad)" dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pipeline breakdown */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Pipeline Breakdown</h3>
          {!pipeline.length ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No pipeline data</div>
          ) : (
            <div className="space-y-3 mt-2">
              {pipeline.map(p => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STAGE_COLORS[p._id] || '#94a3b8' }} />
                  <span className="text-sm text-slate-600 w-28">{STAGE_LABELS[p._id] || p._id}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((p.count / (pipeline.reduce((s, x) => s + x.count, 0))) * 100, 100)}%`, background: STAGE_COLORS[p._id] || '#6366f1' }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-800 w-6 text-right">{p.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity log */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-4">Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No recent activity</p>
        ) : (
          <div className="space-y-0 divide-y divide-slate-50">
            {recentActivity.map((a) => (
              <div key={a._id} className="flex items-center gap-4 py-3">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STAGE_COLORS[a.status] || '#94a3b8' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{a.clientName}</p>
                  <p className="text-xs text-slate-400">{a.product} · {a.notes?.slice(0, 50)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-slate-800">${a.amount?.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">{new Date(a.date).toLocaleDateString()}</p>
                </div>
                <span className={`status-${a.status} flex-shrink-0`}>
                  {STAGE_LABELS[a.status] || a.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
