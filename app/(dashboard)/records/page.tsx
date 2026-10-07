'use client';
// app/(dashboard)/records/page.tsx
// Daily records list page with period date selector, filters, and details
import { useState, useEffect, useCallback } from 'react';
import { PeriodSelector } from '@/components/ui/PeriodSelector';
import { DailyRecordsTable } from '@/components/tables/DailyRecordsTable';
import { useDateFilter } from '@/lib/hooks/useDateFilter';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function RecordsPage() {
  const {
    period,
    setPeriod,
    dateRange,
    handleCustomDateChange,
    queryParams,
  } = useDateFilter('month');

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadRecords = async () => {
      if (queryParams === null) return;

      setLoading(true);
      try {
        const url = `/api/daily-records?${queryParams ? `${queryParams}&` : ''}limit=500`;
        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json();
        
        if (!isMounted) return;
        
        if (json.success) {
          setRecords(json.data.records || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadRecords();
    
    return () => {
      isMounted = false;
    };
  }, [queryParams]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Daily Trips Log</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            History of submitted daily bus logs, odometer readings, and expenses.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <PeriodSelector
            selectedPeriod={period}
            dateRange={dateRange ?? undefined}
            onPeriodChange={setPeriod}
            onCustomDateChange={handleCustomDateChange}
          />
          <Link
            href="/daily-entry"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Daily Entry</span>
          </Link>
        </div>
      </div>

      <DailyRecordsTable records={records} loading={loading} />
    </div>
  );
}
