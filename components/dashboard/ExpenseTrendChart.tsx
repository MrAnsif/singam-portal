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

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
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
            stroke="#2563eb"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#expenseGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
