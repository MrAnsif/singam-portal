'use client';
// components/dashboard/OwnerDashboard.tsx
// Comprehensive financial & operational analytics view for Owner role
import { useState, useEffect, useCallback } from 'react';
import type { Session } from 'next-auth';
import { PeriodSelector } from '@/components/ui/PeriodSelector';
import { useDateFilter } from '@/lib/hooks/useDateFilter';
import { KpiCard } from '@/components/ui/KpiCard';
import { ExpenseBreakdownChart } from './ExpenseBreakdownChart';
import { ExpenseTrendChart } from './ExpenseTrendChart';
import { AlertsPanel } from './AlertsPanel';
import { RecentActivity } from './RecentActivity';
import { detectAlerts, type AlertItem } from '@/lib/alerts';
import {
  Wallet,
  Gauge,
  Fuel,
  Ticket,
  RefreshCw,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

interface OwnerDashboardProps {
  session: Session;
}

export function OwnerDashboard({ session }: OwnerDashboardProps) {
  const {
    period,
    setPeriod,
    dateRange,
    handleCustomDateChange,
    buildQueryParams,
  } = useDateFilter('month');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const fetchStats = useCallback(async () => {
    const queryParams = buildQueryParams();
    if (queryParams === null) return;

    setLoading(true);
    try {
      const url = `/api/dashboard/stats${queryParams ? `?${queryParams}` : ''}`;
      const res = await fetch(url, { cache: 'no-store' });
      const json = await res.json();

      if (json.success) {
        setData(json.data);
        const detected = detectAlerts(json.data.recentActivity || []);
        setAlerts(detected);
      }
    } catch (err) {
      console.error('Failed loading stats', err);
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const kpis = data?.kpis || {};
  const comparison = data?.comparison || {};

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">
            Welcome back, {session.user?.name || 'Owner'}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Operational and financial performance overview
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <PeriodSelector
            selectedPeriod={period}
            dateRange={dateRange ?? undefined}
            onPeriodChange={setPeriod}
            onCustomDateChange={handleCustomDateChange}
          />
          <button
            onClick={fetchStats}
            className="p-2 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/daily-entry"
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Daily Entry</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          id="total-expense"
          label="Total Expenses"
          value={`₹${(kpis.totalExpense || 0).toLocaleString('en-IN')}`}
          subValue={`${kpis.recordCount || 0} daily entries`}
          trend={
            comparison.percentChange !== undefined
              ? { value: comparison.percentChange, comparedTo: 'previous period' }
              : undefined
          }
          icon={<Wallet className="w-5 h-5" />}
          loading={loading}
        />

        <KpiCard
          id="total-distance"
          label="Distance Travelled"
          value={`${(kpis.totalKm || 0).toLocaleString('en-IN')} KM`}
          subValue={kpis.kmPerL ? `${kpis.kmPerL} KM/L avg` : undefined}
          icon={<Gauge className="w-5 h-5 text-blue-600" />}
          loading={loading}
        />

        <KpiCard
          id="diesel-cost"
          label="Diesel Spent"
          value={`₹${(kpis.totalDieselCost || 0).toLocaleString('en-IN')}`}
          subValue={`${(kpis.totalDieselL || 0).toLocaleString('en-IN')} Litres`}
          icon={<Fuel className="w-5 h-5 text-amber-600" />}
          loading={loading}
        />

        <KpiCard
          id="booking-revenue"
          label="Trip Bookings"
          value={`₹${(kpis.totalBookingRevenue || 0).toLocaleString('en-IN')}`}
          subValue={`${kpis.totalBookings || 0} trip hires`}
          icon={<Ticket className="w-5 h-5 text-emerald-600" />}
          loading={loading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
          <h3 className="font-semibold text-neutral-900 mb-4">Expense Breakdown</h3>
          <ExpenseBreakdownChart data={data?.expenseByCategory || []} />
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
          <h3 className="font-semibold text-neutral-900 mb-4">Expense & Activity Trend</h3>
          <ExpenseTrendChart data={data?.recentActivity?.map((r: any) => ({
            date: new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
            amount: (r.diesel?.total || 0) + (r.adblue?.total || 0),
          })).reverse()} />
        </div>
      </div>

      {/* Alerts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AlertsPanel alerts={alerts} />
        </div>

        <div className="lg:col-span-2">
          <RecentActivity records={data?.recentActivity || []} />
        </div>
      </div>
    </div>
  );
}
