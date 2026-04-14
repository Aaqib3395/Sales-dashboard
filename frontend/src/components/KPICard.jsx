import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function formatValue(value, type) {
  if (type === 'currency') {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value?.toLocaleString() ?? 0}`;
  }
  if (type === 'percent') return `${value}%`;
  if (type === 'number') return value?.toLocaleString() ?? 0;
  return value;
}

export default function KPICard({ title, value, type = 'number', change, changeLabel, icon: Icon, color, delay = 0 }) {
  const colorMap = {
    indigo: { bg: 'bg-primary-50', icon: 'text-primary-600', border: 'border-primary-100' },
    green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-orange-100' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600', border: 'border-violet-100' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
  };

  const c = colorMap[color] || colorMap.indigo;
  const isPositive = change > 0;
  const isNeutral = change === 0 || change == null;

  return (
    <div
      className="kpi-card"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-display font-bold text-slate-800 mt-1">
            {value != null ? formatValue(value, type) : (
              <span className="inline-block w-24 h-7 bg-slate-100 rounded animate-pulse" />
            )}
          </p>
        </div>
        <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
          <Icon size={18} className={c.icon} />
        </div>
      </div>

      {change != null && (
        <div className="flex items-center gap-1.5">
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${
            isNeutral ? 'text-slate-500' : isPositive ? 'text-emerald-600' : 'text-red-500'
          }`}>
            {isNeutral ? (
              <Minus size={12} />
            ) : isPositive ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            {isNeutral ? '0%' : `${isPositive ? '+' : ''}${change}%`}
          </span>
          <span className="text-xs text-slate-400">{changeLabel || 'vs last period'}</span>
        </div>
      )}
    </div>
  );
}
