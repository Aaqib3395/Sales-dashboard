import { useState, useEffect, useCallback } from 'react';
import { Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getGoals, createGoal, getGoalHistory, getEmployees } from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Goals() {
  const { hasRole } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [goals, setGoals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyEmpId, setHistoryEmpId] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [gRes, eRes] = await Promise.all([getGoals({ year, month }), getEmployees()]);
      setGoals(gRes.data);
      setEmployees(eRes.data.employees);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [year, month]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (historyEmpId) {
      getGoalHistory(historyEmpId).then((res) => setHistory(res.data)).catch(console.error);
    }
  }, [historyEmpId]);

  const handleSetTarget = async (employeeId, targetAmount) => {
    await createGoal({ employeeId, targetAmount: Number(targetAmount), month, year });
    fetchData();
  };

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-800">Goals & Targets</h2>
          <p className="text-sm text-slate-400 mt-0.5">Set and track revenue targets per employee</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2 py-1">
          <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg"><ChevronLeft size={16} className="text-slate-500" /></button>
          <span className="text-sm font-semibold text-slate-700 w-24 text-center">{MONTHS[month - 1]} {year}</span>
          <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg"><ChevronRight size={16} className="text-slate-500" /></button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                {['Employee', 'Team', 'Target', 'Actual', 'Progress', 'Deals', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase py-3 px-4">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {goals.map((g) => {
                  const pct = g.progress || 0;
                  const barColor = pct >= 100 ? 'bg-emerald-500' : pct >= 75 ? 'bg-blue-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-400';
                  return (
                    <tr key={g._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-800">{g.employeeId?.name || '—'}</td>
                      <td className="py-3 px-4 text-slate-500">{g.employeeId?.team}</td>
                      <td className="py-3 px-4">
                        {hasRole('Admin', 'Manager') ? (
                          <input
                            type="number"
                            className="input w-28 text-sm"
                            defaultValue={g.targetAmount}
                            onBlur={(e) => handleSetTarget(g.employeeId?._id, e.target.value)}
                          />
                        ) : (
                          <span className="font-medium">${g.targetAmount?.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">${g.actual?.toLocaleString()}</td>
                      <td className="py-3 px-4 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2">
                            <div className={`h-2 rounded-full ${barColor} transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className={`text-xs font-bold ${pct >= 100 ? 'text-emerald-600' : pct < 50 ? 'text-red-500' : 'text-slate-600'}`}>{pct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{g.deals}</td>
                      <td className="py-3 px-4">
                        <button onClick={() => setHistoryEmpId(g.employeeId?._id)} className="text-xs text-primary-600 hover:underline">History</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* History modal */}
      {historyEmpId && history.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Target size={16} className="text-primary-600" /> Target History</h3>
            <button onClick={() => setHistoryEmpId(null)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={48} />
              <Tooltip formatter={(v) => [`$${v?.toLocaleString()}`, '']} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="target" name="Target" fill="#94a3b8" radius={[3, 3, 0, 0]} maxBarSize={24} />
              <Bar dataKey="actual" name="Actual" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
