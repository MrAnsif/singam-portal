'use client';
// app/(dashboard)/expenses/page.tsx
// Owner-only Expenses page with summary cards and itemized expenses table
import { useState, useEffect, useCallback } from 'react';
import { PeriodSelector } from '@/components/ui/PeriodSelector';
import { useDateFilter } from '@/lib/hooks/useDateFilter';
import { Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function ExpensesPage() {
  const {
    period,
    setPeriod,
    dateRange,
    handleCustomDateChange,
    queryParams,
  } = useDateFilter('month');

  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    
    const loadExpenses = async () => {
      if (queryParams === null) return;

      setLoading(true);
      try {
        const url = `/api/expenses${queryParams ? `?${queryParams}` : ''}`;
        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json();
        
        if (!isMounted) return;
        
        if (json.success) {
          setExpenses(json.data.expenses || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadExpenses();
    
    return () => {
      isMounted = false;
    };
  }, [queryParams]);

  const filtered = expenses.filter((e) => {
    const matchesSearch =
      (e.busPlate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || (e.category || '').toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const totalExpense = filtered.reduce((s, e) => s + (e.amount || 0), 0);
  const dieselExpense = filtered
    .filter((e) => e.category === 'Diesel')
    .reduce((s, e) => s + (e.amount || 0), 0);
  const adblueExpense = filtered
    .filter((e) => e.category === 'AdBlue')
    .reduce((s, e) => s + (e.amount || 0), 0);
  const otherExpense = totalExpense - dieselExpense - adblueExpense;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Expenses Breakdown</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Itemized breakdown of fuel, AdBlue, tolls, and maintenance costs.
          </p>
        </div>

        <PeriodSelector
          selectedPeriod={period}
          dateRange={dateRange ?? undefined}
          onPeriodChange={setPeriod}
          onCustomDateChange={handleCustomDateChange}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-neutral-500 font-medium">Total Expenses</span>
          <p className="text-xl font-bold text-neutral-900 mt-1">₹{totalExpense.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-neutral-500 font-medium">Diesel Fuel</span>
          <p className="text-xl font-bold text-amber-900 mt-1">₹{dieselExpense.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-neutral-500 font-medium">AdBlue</span>
          <p className="text-xl font-bold text-blue-900 mt-1">₹{adblueExpense.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-neutral-500 font-medium">Other (Toll/Maint)</span>
          <p className="text-xl font-bold text-indigo-900 mt-1">₹{otherExpense.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by bus plate or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <Filter className="w-3.5 h-3.5 text-neutral-500" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs"
          >
            <option value="all">All Categories</option>
            <option value="diesel">Diesel</option>
            <option value="adblue">AdBlue</option>
            <option value="toll">Toll</option>
            <option value="parking">Parking</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-neutral-600">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Bus</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Entered By</th>
              <th className="py-3 px-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-400">Loading expenses...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-400">No expense records found.</td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/80">
                  <td className="py-3 px-4 font-medium text-neutral-900">
                    {format(new Date(item.date), 'dd MMM yyyy')}
                  </td>
                  <td className="py-3 px-4 font-bold text-neutral-900">{item.busPlate}</td>
                  <td className="py-3 px-4">
                    <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-full font-medium text-[11px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-neutral-700">{item.description}</td>
                  <td className="py-3 px-4 text-neutral-500">{item.enteredBy}</td>
                  <td className="py-3 px-4 text-right font-bold text-neutral-900">
                    ₹{item.amount.toLocaleString('en-IN')}
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
