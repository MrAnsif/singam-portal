'use client';
// components/dashboard/ManagerDashboard.tsx
// Data-entry focused, action-oriented dashboard for Manager role
import { useState, useEffect } from 'react';
import type { Session } from 'next-auth';
import Link from 'next/link';
import { Plus, Clock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { RecentActivity } from './RecentActivity';

interface ManagerDashboardProps {
  session: Session;
}

export function ManagerDashboard({ session }: ManagerDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadManagerStats() {
      try {
        const res = await fetch('/api/dashboard/stats?period=month');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadManagerStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-900 to-brand-800 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-brand-700/60 text-brand-100 text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
            Manager Operational Desk
          </span>
          <h1 className="text-2xl font-bold mt-2">
            Hello, {session.user?.name || 'Manager'}
          </h1>
          <p className="text-brand-200 text-xs mt-1">
            Log daily trip details, diesel consumption, and trip bookings.
          </p>
        </div>

        <Link
          href="/daily-entry"
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-white text-brand-900 hover:bg-brand-50 font-semibold text-sm rounded-xl transition-all shadow-md shrink-0"
        >
          <Plus className="w-5 h-5 text-brand-600" />
          <span>New Daily Entry</span>
        </Link>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/daily-entry"
          className="p-5 bg-white border border-neutral-200 rounded-xl hover:border-brand-300 hover:shadow-xs transition-all flex items-center space-x-4"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 text-sm">Add Trip Entry</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Record fuel, KM, and trip costs</p>
          </div>
        </Link>

        <Link
          href="/records"
          className="p-5 bg-white border border-neutral-200 rounded-xl hover:border-brand-300 hover:shadow-xs transition-all flex items-center space-x-4"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 text-sm">View Logged Records</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Check and edit submitted records</p>
          </div>
        </Link>

        <div className="p-5 bg-white border border-neutral-200 rounded-xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 text-sm">Entries This Month</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {loading ? 'Loading...' : `${data?.kpis?.recordCount || 0} records logged`}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Records list */}
      <RecentActivity records={data?.recentActivity || []} />
    </div>
  );
}
