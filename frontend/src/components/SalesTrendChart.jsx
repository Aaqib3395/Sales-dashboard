import {
  ResponsiveContainer, ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-semibold text-slate-800">
            {p.dataKey === 'revenue'
              ? `$${p.value?.toLocaleString()}`
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SalesTrendChart({ data = [], loading }) {
  if (loading) {
    return (
      <div className="h-64 bg-slate-50 rounded-xl animate-pulse" />
    );
  }

  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Sans' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Sans' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          width={52}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Sans' }}
          axisLine={false}
          tickLine={false}
          width={30}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '12px', fontFamily: 'DM Sans', paddingTop: '12px' }}
        />
        <Bar
          yAxisId="left"
          dataKey="revenue"
          name="Revenue"
          fill="#6366f1"
          radius={[4, 4, 0, 0]}
          opacity={0.85}
          maxBarSize={32}
        />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="revenue"
          name="Revenue Trend"
          stroke="#6366f1"
          strokeWidth={0}
          fill="url(#revenueGrad)"
          dot={false}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="deals"
          name="Deals"
          stroke="#22c55e"
          strokeWidth={2.5}
          dot={{ fill: '#22c55e', r: 3.5, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
