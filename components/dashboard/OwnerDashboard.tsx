'use client';
// components/dashboard/OwnerDashboard.tsx
// Comprehensive financial & operational analytics view for Owner role
import { useState, useEffect } from 'react';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import { PeriodSelector } from '@/components/ui/PeriodSelector';
import { useDateFilter } from '@/lib/hooks/useDateFilter';
import { KpiCard } from '@/components/ui/KpiCard';
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
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import Link from 'next/link';

// Dynamically import heavy chart components
const ExpenseBreakdownChart = dynamic(() => import('./ExpenseBreakdownChart').then(mod => mod.ExpenseBreakdownChart), { ssr: false });
const ExpenseTrendChart = dynamic(() => import('./ExpenseTrendChart').then(mod => mod.ExpenseTrendChart), { ssr: false });
const RevenueBreakdownChart = dynamic(() => import('./RevenueBreakdownChart').then(mod => mod.RevenueBreakdownChart), { ssr: false });

interface OwnerDashboardProps {
  session: Session;
}

export function OwnerDashboard({ session }: OwnerDashboardProps) {
  const {
    period,
    setPeriod,
    dateRange,
    handleCustomDateChange,
    queryParams,
  } = useDateFilter('month');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchStats = async () => {
      if (queryParams === null) return;
      
      setLoading(true);
      try {
        const url = `/api/dashboard/stats${queryParams ? `?${queryParams}` : ''}`;
        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json();

        if (!isMounted) return;

        if (json.success) {
          setData(json.data);
          const detected = detectAlerts(json.data.recentActivity || []);
          setAlerts(detected);
        }
      } catch (err) {
        console.error('Failed loading stats', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();
    
    return () => {
      isMounted = false;
    };
  }, [queryParams]); // Only runs when stable queryParams string changes

  const kpis = data?.kpis || {};
  const comparison = data?.comparison || {};

  // Calculate gross profit
  const grossProfit = (kpis.totalBookingRevenue || 0) - (kpis.totalExpense || 0);
  const isProfit = grossProfit >= 0;

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

        <div className="flex flex-wrap items-center gap-3">
          <PeriodSelector
            selectedPeriod={period}
            dateRange={dateRange ?? undefined}
            onPeriodChange={setPeriod}
            onCustomDateChange={handleCustomDateChange}
          />
          <Link
            href="/daily-entry"
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Daily Entry</span>
          </Link>
        </div>
      </div>

      {/* Hero Gross Profit Card */}
      <div className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm ${
        isProfit 
          ? 'bg-gradient-to-br from-success-50 to-white border-success-100' 
          : 'bg-gradient-to-br from-danger-50 to-white border-danger-100'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-sm font-bold text-neutral-600 uppercase tracking-wider">Gross Profit</h2>
              {loading ? (
                <RefreshCw className="w-4 h-4 text-neutral-400 animate-spin" />
              ) : isProfit ? (
                <TrendingUp className="w-5 h-5 text-success-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-danger-600" />
              )}
            </div>
            <div className="flex items-baseline gap-3">
              <span className={`text-4xl md:text-5xl font-black ${isProfit ? 'text-success-700' : 'text-danger-700'}`}>
                ₹{Math.abs(grossProfit).toLocaleString('en-IN')}
              </span>
              <span className={`text-sm font-semibold ${isProfit ? 'text-success-600' : 'text-danger-600'}`}>
                {isProfit ? 'PROFIT' : 'LOSS'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-2 max-w-sm">
              Revenue minus operational costs (Diesel, AdBlue, Other).
            </p>
          </div>
          
          {/* Quick Stats within Hero */}
          <div className="flex gap-4 md:gap-8 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
            <div>
              <p className="text-xs font-semibold text-neutral-500 mb-1">Total Revenue</p>
              <p className="text-lg font-bold text-neutral-900">₹{(kpis.totalBookingRevenue || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="w-px bg-neutral-200"></div>
            <div>
              <p className="text-xs font-semibold text-neutral-500 mb-1">Total Expenses</p>
              <p className="text-lg font-bold text-neutral-900">₹{(kpis.totalExpense || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
        
        {/* Background Decorative Element */}
        <div className={`absolute -bottom-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-30 ${isProfit ? 'bg-success-400' : 'bg-danger-400'}`}></div>
      </div>

      {/* Secondary KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          id="total-expense"
          label="Operational Expenses"
          value={`₹${(kpis.totalExpense || 0).toLocaleString('en-IN')}`}
          subValue={`${kpis.recordCount || 0} daily entries`}
          trend={
            comparison.percentChange !== undefined
              ? { value: comparison.percentChange, comparedTo: 'previous period' }
              : undefined
          }
          icon={<Wallet className="w-5 h-5 text-neutral-600" />}
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
          icon={<Ticket className="w-5 h-5 text-success-600" />}
          loading={loading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
          <h3 className="font-semibold text-neutral-900 mb-4">Revenue by Customer Group</h3>
          <RevenueBreakdownChart data={data?.revenueByCustomerGroup || []} />
        </div>

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
