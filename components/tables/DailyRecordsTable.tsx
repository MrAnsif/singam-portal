'use client';
// components/tables/DailyRecordsTable.tsx
// Filterable, search-enabled table for viewing daily records with drawer detail trigger
import { useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RecordDetailDrawer } from './RecordDetailDrawer';
import { Search, Filter, Eye, Edit3, Bus, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface DailyRecordsTableProps {
  records: any[];
  loading?: boolean;
  onRefresh?: () => void;
}

export function DailyRecordsTable({ records, loading }: DailyRecordsTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = records.filter((r) => {
    const busPlate =
      typeof r.busId === 'object' && r.busId?.plateNumber
        ? r.busId.plateNumber.toLowerCase()
        : '';
    const driverName =
      typeof r.driverId === 'object' && r.driverId?.name
        ? r.driverId.name.toLowerCase()
        : '';
    const matchesSearch =
      busPlate.includes(searchTerm.toLowerCase()) ||
      driverName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by bus plate or driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 text-neutral-600">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold">Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs text-neutral-800"
          >
            <option value="all">All Records</option>
            <option value="draft">Drafts</option>
            <option value="complete">Complete</option>
            <option value="edited">Edited</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden hidden md:block">
        <table className="w-full text-left text-xs text-neutral-600">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Bus</th>
              <th className="py-3 px-4">Distance</th>
              <th className="py-3 px-4">Diesel (L / ₹)</th>
              <th className="py-3 px-4">Bookings</th>
              <th className="py-3 px-4">Total Exp</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-neutral-400">
                  Loading daily records...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-neutral-400">
                  No matching daily records found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const busPlate =
                  typeof r.busId === 'object' && r.busId?.plateNumber
                    ? r.busId.plateNumber
                    : 'Bus';
                const totalOther =
                  r.otherExpenses?.reduce((s: number, e: any) => s + (e.amount || 0), 0) || 0;
                const totalExp =
                  (r.diesel?.total || 0) + (r.adblue?.total || 0) + totalOther;

                return (
                  <tr
                    key={r._id}
                    className="hover:bg-neutral-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedRecord(r)}
                  >
                    <td className="py-3 px-4 font-medium text-neutral-900">
                      {format(new Date(r.date), 'dd MMM yyyy')}
                    </td>
                    <td className="py-3 px-4 font-bold text-neutral-900">{busPlate}</td>
                    <td className="py-3 px-4">{r.travelledKm} KM</td>
                    <td className="py-3 px-4">
                      {r.diesel?.qty || 0}L <span className="text-neutral-400">/</span> ₹{(r.diesel?.total || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      {r.bookings?.length > 0 ? (
                        <span className="text-emerald-700 font-semibold">
                          {r.bookings.length} trip{r.bookings.length > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-neutral-900">
                      ₹{totalExp.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="p-1.5 text-neutral-500 hover:text-brand-600 hover:bg-neutral-100 rounded-md"
                        title="View detail drawer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/daily-entry/${r._id}`}
                        className="p-1.5 text-neutral-500 hover:text-brand-600 hover:bg-neutral-100 rounded-md inline-block"
                        title="Edit record"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="space-y-3 md:hidden">
        {filtered.map((r) => {
          const busPlate =
            typeof r.busId === 'object' && r.busId?.plateNumber
              ? r.busId.plateNumber
              : 'Bus';
          const totalOther =
            r.otherExpenses?.reduce((s: number, e: any) => s + (e.amount || 0), 0) || 0;
          const totalExp = (r.diesel?.total || 0) + (r.adblue?.total || 0) + totalOther;

          return (
            <div
              key={r._id}
              onClick={() => setSelectedRecord(r)}
              className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bus className="w-4 h-4 text-brand-600" />
                  <span className="font-bold text-neutral-900 text-sm">{busPlate}</span>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 py-1 text-neutral-600 border-y border-neutral-100">
                <div>Date: <strong>{format(new Date(r.date), 'dd MMM yyyy')}</strong></div>
                <div>Distance: <strong>{r.travelledKm} KM</strong></div>
                <div>Diesel: <strong>₹{(r.diesel?.total || 0).toLocaleString('en-IN')}</strong></div>
                <div>Total Exp: <strong>₹{totalExp.toLocaleString('en-IN')}</strong></div>
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  onClick={() => setSelectedRecord(r)}
                  className="px-3 py-1.5 bg-neutral-100 text-neutral-700 font-semibold rounded-lg"
                >
                  View Details
                </button>
                <Link
                  href={`/daily-entry/${r._id}`}
                  className="px-3 py-1.5 bg-brand-600 text-white font-semibold rounded-lg"
                >
                  Edit
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer */}
      <RecordDetailDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
}
