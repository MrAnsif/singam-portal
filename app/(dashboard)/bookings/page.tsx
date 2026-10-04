'use client';
// app/(dashboard)/bookings/page.tsx
// Owner Bookings & Trip Hires management view
import { useState, useEffect } from 'react';
import { PeriodSelector, type Period } from '@/components/ui/PeriodSelector';
import { Search, Ticket, TrendingUp, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function BookingsPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadBookings() {
      setLoading(true);
      try {
        const res = await fetch('/api/bookings');
        const json = await res.json();
        if (json.success) {
          setBookings(json.data.bookings || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, [period]);

  const filtered = bookings.filter(
    (b) =>
      b.customerGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.busPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = filtered.reduce((s, b) => s + b.revenue, 0);
  const totalCost = filtered.reduce((s, b) => s + b.cost, 0);
  const totalNet = totalRevenue - totalCost;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Trip Hires & Bookings</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Track special customer trip bookings, revenue generated, and trip execution costs.
          </p>
        </div>

        <PeriodSelector selectedPeriod={period} onPeriodChange={setPeriod} />
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-neutral-500 font-medium">Total Bookings</span>
          <p className="text-xl font-bold text-neutral-900 mt-1">{filtered.length} Hires</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-neutral-500 font-medium">Gross Revenue</span>
          <p className="text-xl font-bold text-emerald-700 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-neutral-500 font-medium">Direct Trip Cost</span>
          <p className="text-xl font-bold text-rose-700 mt-1">₹{totalCost.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-neutral-500 font-medium">Net Contribution</span>
          <p className="text-xl font-bold text-brand-900 mt-1">₹{totalNet.toLocaleString('en-IN')}</p>
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
              <th className="py-3 px-4">Revenue</th>
              <th className="py-3 px-4">Trip Cost</th>
              <th className="py-3 px-4 text-right">Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-neutral-400">Loading trip hires...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-neutral-400">No booking entries found.</td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id} className="hover:bg-neutral-50/80">
                  <td className="py-3 px-4 font-medium text-neutral-900">
                    {format(new Date(b.date), 'dd MMM yyyy')}
                  </td>
                  <td className="py-3 px-4 font-bold text-neutral-900">{b.busPlate}</td>
                  <td className="py-3 px-4 font-semibold text-neutral-800">{b.customerGroup}</td>
                  <td className="py-3 px-4 text-neutral-500">{b.reference}</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">₹{b.revenue.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-medium text-rose-600">₹{b.cost.toLocaleString('en-IN')}</td>
                  <td className={`py-3 px-4 text-right font-bold ${b.net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    ₹{b.net.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
