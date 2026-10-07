'use client';
// components/dashboard/RevenueBreakdownChart.tsx
// Horizontal bar chart showing revenue breakdown by customer group using Recharts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

interface RevenueBreakdownProps {
  data: { group: string; revenue: number }[];
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#f59e0b', '#64748b'];

export function RevenueBreakdownChart({ data }: RevenueBreakdownProps) {
  // Sort data by revenue descending and take top 5
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  
  const formattedData = sortedData.map((d) => ({
    ...d,
    formattedRevenue: `₹${d.revenue.toLocaleString('en-IN')}`,
  }));

  const total = data.reduce((sum, d) => sum + d.revenue, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-neutral-400 text-sm">
        No booking revenue recorded for this period.
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
              dataKey="group"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#475569' }}
              width={80}
            />
            <Tooltip
              formatter={(val: any) => [val ? `₹${Number(val).toLocaleString('en-IN')}` : '₹0', 'Revenue']}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={20}>
              {formattedData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
        {sortedData.map((d, i) => {
          const pct = total > 0 ? ((d.revenue / total) * 100).toFixed(0) : '0';
          return (
            <div key={d.group} className="flex items-center space-x-2 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <div className="truncate">
                <p className="text-neutral-500 font-medium truncate w-[100px]" title={d.group}>{d.group}</p>
                <p className="font-semibold text-neutral-900">₹{d.revenue.toLocaleString('en-IN')} ({pct}%)</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
