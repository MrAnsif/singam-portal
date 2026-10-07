'use client';
// components/dashboard/ExpenseTrendChart.tsx
// Area / Line chart showing trend over time
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface ExpenseTrendProps {
  data?: { date: string; amount: number; km?: number }[];
}

export function ExpenseTrendChart({ data = [] }: ExpenseTrendProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-neutral-400 text-sm">
        No daily trend entries available for this range.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.amount));
  const min = Math.min(...data.map((d) => d.amount));
  const avg = data.reduce((s, d) => s + d.amount, 0) / data.length;
  // Calculate percentage from top of graph to bottom (max is top, min is bottom)
  const offsetPercent = max === min ? 50 : ((max - avg) / (max - min)) * 100;

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="splitStroke" x1="0" y1="0" x2="0" y2="1">
              <stop offset={`${offsetPercent}%`} stopColor="var(--color-danger-200)" stopOpacity={1} />
              <stop offset={`${offsetPercent}%`} stopColor="var(--color-success-200)" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="splitFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-danger-200)" stopOpacity={0.3} />
              <stop offset={`${offsetPercent}%`} stopColor="var(--color-danger-200)" stopOpacity={0.05} />
              <stop offset={`${offsetPercent}%`} stopColor="var(--color-success-200)" stopOpacity={0.1} />
              <stop offset="100%" stopColor="var(--color-success-200)" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#64748b' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(val: any) => [val ? `₹${Number(val).toLocaleString('en-IN')}` : '₹0', 'Expense']}
            labelStyle={{ color: '#64748b', fontStyle: 'italic' }}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '8px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="url(#splitStroke)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#splitFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
