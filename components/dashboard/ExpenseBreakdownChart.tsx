'use client';
// components/dashboard/ExpenseBreakdownChart.tsx
// Horizontal bar chart showing expense breakdown by category using Recharts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

interface ExpenseBreakdownProps {
  data: { category: string; amount: number }[];
}

const COLORS = ['#2563eb', '#0891b2', '#f59e0b', '#64748b'];

export function ExpenseBreakdownChart({ data }: ExpenseBreakdownProps) {
  const formattedData = data.map((d) => ({
    ...d,
    formattedAmount: `₹${d.amount.toLocaleString('en-IN')}`,
  }));

  const total = data.reduce((sum, d) => sum + d.amount, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-neutral-400 text-sm">
        No expense data recorded for this period.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={formattedData}
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="category"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#475569' }}
              width={65}
            />
            <Tooltip
              formatter={(val: any) => [val ? `₹${Number(val).toLocaleString('en-IN')}` : '₹0', 'Amount']}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={20}>
              {formattedData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-100">
        {data.map((d, i) => {
          const pct = total > 0 ? ((d.amount / total) * 100).toFixed(0) : '0';
          return (
            <div key={d.category} className="flex items-center space-x-2 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <div className="truncate">
                <p className="text-neutral-500 font-medium">{d.category}</p>
                <p className="font-semibold text-neutral-900">₹{d.amount.toLocaleString('en-IN')} ({pct}%)</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
