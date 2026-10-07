'use client';
// app/(dashboard)/bookings/page.tsx
// Owner Bookings & Trip Hires management view — revenue-only (cost no longer tracked)
import { useState, useEffect, useCallback } from 'react';
import { PeriodSelector } from '@/components/ui/PeriodSelector';
import { useDateFilter } from '@/lib/hooks/useDateFilter';
import { Search, Ticket, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function BookingsPage() {
  const {
    period,
    setPeriod,
    dateRange,
    handleCustomDateChange,
    queryParams,
  } = useDateFilter('month');

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    const loadBookings = async () => {
      if (queryParams === null) return;

      setLoading(true);
      try {
        const url = `/api/bookings${queryParams ? `?${queryParams}` : ''}`;
        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json();
        
        if (!isMounted) return;
        
        if (json.success) {
          setBookings(json.data.bookings || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadBookings();
    
    return () => {
      isMounted = false;
    };
  }, [queryParams]);

  // Filter by search term client-side (name / plate / reference)
  const filtered = bookings.filter(
    (b) =>
      (b.customerGroup || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.busPlate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.reference || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = filtered.reduce((s, b) => s + (b.revenue || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Trip Hires &amp; Bookings</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Track special customer trip bookings and revenue earned.
          </p>
        </div>

        <PeriodSelector
          selectedPeriod={period}
          dateRange={dateRange ?? undefined}
          onPeriodChange={setPeriod}
          onCustomDateChange={handleCustomDateChange}
        />
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs flex items-center space-x-4">
          <div className="p-2.5 bg-success-50 rounded-xl">
            <Ticket className="w-5 h-5 text-success-600" />
          </div>
          <div>
            <span className="text-neutral-500 font-medium block">Total Bookings</span>
            <p className="text-xl font-bold text-neutral-900 mt-0.5">{filtered.length} <span className="text-sm font-medium text-neutral-400">hires</span></p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs flex items-center space-x-4">
          <div className="p-2.5 bg-success-50 rounded-xl">
            <TrendingUp className="w-5 h-5 text-success-600" />
          </div>
          <div>
            <span className="text-neutral-500 font-medium block">Gross Revenue</span>
            <p className="text-xl font-bold text-success-700 mt-0.5">₹{totalRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer, bus plate, or reference number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-neutral-600">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Bus</th>
              <th className="py-3 px-4">Customer / Group</th>
              <th className="py-3 px-4">Reference</th>
              <th className="py-3 px-4 text-right">Revenue</th>
              <th className="py-3 px-4">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center">
                  <div className="flex flex-col items-center space-y-2 text-neutral-400">
                    <Ticket className="w-6 h-6 animate-pulse" />
                    <span className="text-xs">Loading trip hires...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center">
                  <div className="flex flex-col items-center space-y-2 text-neutral-400">
                    <Ticket className="w-6 h-6" />
                    <span className="text-xs">No bookings found for the selected period.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4 font-medium text-neutral-900">
                    {format(new Date(b.date), 'dd MMM yyyy')}
                  </td>
                  <td className="py-3 px-4 font-bold text-neutral-900">{b.busPlate}</td>
                  <td className="py-3 px-4 font-semibold text-neutral-800">{b.customerGroup}</td>
                  <td className="py-3 px-4 text-neutral-500">{b.reference}</td>
                  <td className="py-3 px-4 text-right font-bold text-success-700">
                    ₹{(b.revenue || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-neutral-400 italic">{b.notes || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer total row */}
        {!loading && filtered.length > 0 && (
          <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-3 flex items-center justify-between text-xs font-semibold text-neutral-700">
            <span>{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</span>
            <span className="text-success-700">Total Revenue: ₹{totalRevenue.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
