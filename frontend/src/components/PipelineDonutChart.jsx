import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700">{d.label}</p>
      <p className="text-slate-600 mt-1">Count: <span className="font-bold">{d.count}</span></p>
      <p className="text-slate-600">Value: <span className="font-bold">${d.value?.toLocaleString()}</span></p>
    </div>
  );
}

export default function PipelineDonutChart({ data = [], loading }) {
  if (loading) return <div className="h-56 bg-slate-50 rounded-xl animate-pulse" />;
  if (!data.length) return <div className="h-56 flex items-center justify-center text-slate-400 text-sm">No pipeline data</div>;

  const chartData = data.map((d) => ({ ...d, name: d.label, value: d.count }));

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {chartData.map((entry) => (
              <Cell key={entry.status} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 w-full mt-1">
        {data.map((d) => (
          <div key={d.status} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="text-xs text-slate-600 truncate">{d.label}</span>
            <span className="text-xs font-semibold text-slate-800 ml-auto">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
