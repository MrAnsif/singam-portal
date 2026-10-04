'use client';
// components/tables/RecordDetailDrawer.tsx
// Side-drawer detailing daily record entry with direct Edit button (PRD §70)
import { X, Edit3, Calendar, Bus, Gauge, Fuel, Users, Ticket, Receipt, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { format } from 'date-fns';

interface RecordDetailDrawerProps {
  record: any | null;
  onClose: () => void;
}

export function RecordDetailDrawer({ record, onClose }: RecordDetailDrawerProps) {
  if (!record) return null;

  const busPlate =
    typeof record.busId === 'object' && record.busId?.plateNumber
      ? record.busId.plateNumber
      : 'Bus';

  const driverName =
    typeof record.driverId === 'object' && record.driverId?.name
      ? record.driverId.name
      : record.driverId || 'Not assigned';

  const attendantName =
    typeof record.attendantId === 'object' && record.attendantId?.name
      ? record.attendantId.name
      : record.attendantId || 'Not assigned';

  const createdByName =
    typeof record.createdBy === 'object' && record.createdBy?.name
      ? record.createdBy.name
      : 'Staff';

  const totalOther = record.otherExpenses?.reduce((s: number, e: any) => s + (e.amount || 0), 0) || 0;
  const totalExp = (record.diesel?.total || 0) + (record.adblue?.total || 0) + totalOther;
  const totalRev = record.bookings?.reduce((s: number, b: any) => s + (b.revenue || 0), 0) || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-lg text-neutral-900">{busPlate}</h2>
              <StatusBadge status={record.status} />
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              {format(new Date(record.date), 'EEEE, dd MMMM yyyy')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-5 space-y-6 flex-1 text-xs">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <span className="text-[10px] text-neutral-400 font-medium uppercase">Total Expense</span>
              <p className="text-base font-bold text-neutral-900 mt-0.5">₹{totalExp.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <span className="text-[10px] text-neutral-400 font-medium uppercase">Distance</span>
              <p className="text-base font-bold text-neutral-900 mt-0.5">{record.travelledKm} KM</p>
            </div>
          </div>

          {/* Section: Odometer */}
          <div className="space-y-2">
            <h3 className="font-semibold text-neutral-900 flex items-center space-x-1.5">
              <Gauge className="w-4 h-4 text-blue-600" />
              <span>Odometer Log</span>
            </h3>
            <div className="p-3 bg-neutral-50 rounded-xl space-y-1.5">
              <div className="flex justify-between">
                <span className="text-neutral-500">Opening KM:</span>
                <span className="font-semibold">{record.openingKm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Closing KM:</span>
                <span className="font-semibold">{record.closingKm}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-1.5 font-semibold text-blue-900">
                <span>Distance Travelled:</span>
                <span>{record.travelledKm} KM</span>
              </div>
            </div>
          </div>

          {/* Section: Fuel & AdBlue */}
          <div className="space-y-2">
            <h3 className="font-semibold text-neutral-900 flex items-center space-x-1.5">
              <Fuel className="w-4 h-4 text-amber-600" />
              <span>Fuel & AdBlue</span>
            </h3>
            <div className="p-3 bg-neutral-50 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Diesel Refill:</span>
                <span className="font-semibold">{record.diesel?.qty || 0} L @ ₹{record.diesel?.pricePerL || 0} = ₹{record.diesel?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">AdBlue Refill:</span>
                <span className="font-semibold">{record.adblue?.qty || 0} L @ ₹{record.adblue?.pricePerL || 0} = ₹{record.adblue?.total || 0}</span>
              </div>
            </div>
          </div>

          {/* Section: Staff */}
          <div className="space-y-2">
            <h3 className="font-semibold text-neutral-900 flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Staff Duty</span>
            </h3>
            <div className="p-3 bg-neutral-50 rounded-xl space-y-1">
              <p><span className="text-neutral-500">Driver:</span> <strong className="text-neutral-900">{driverName}</strong></p>
              <p><span className="text-neutral-500">Attendant:</span> <strong className="text-neutral-900">{attendantName}</strong></p>
            </div>
          </div>

          {/* Section: Bookings */}
          {record.bookings?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-neutral-900 flex items-center space-x-1.5">
                <Ticket className="w-4 h-4 text-emerald-600" />
                <span>Bookings ({record.bookings.length})</span>
              </h3>
              <div className="p-3 bg-neutral-50 rounded-xl space-y-2">
                {record.bookings.map((b: any, i: number) => (
                  <div key={i} className="flex justify-between border-b border-neutral-200 last:border-0 pb-1.5 last:pb-0">
                    <div>
                      <p className="font-medium text-neutral-900">{b.customerGroup || 'Booking'}</p>
                      <p className="text-[10px] text-neutral-400">{b.reference || 'No Ref'}</p>
                    </div>
                    <div className="text-right font-semibold text-emerald-700">
                      ₹{(b.revenue || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Other Expenses */}
          {record.otherExpenses?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-neutral-900 flex items-center space-x-1.5">
                <Receipt className="w-4 h-4 text-amber-600" />
                <span>Other Expenses ({record.otherExpenses.length})</span>
              </h3>
              <div className="p-3 bg-neutral-50 rounded-xl space-y-2">
                {record.otherExpenses.map((e: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span>{e.category} {e.note ? `(${e.note})` : ''}</span>
                    <span className="font-semibold">₹{e.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entry Audit Meta */}
          <div className="text-[11px] text-neutral-400 pt-2 flex items-center justify-between border-t border-neutral-100">
            <span>Entered by {createdByName}</span>
            <span>ID: {record._id.substring(0, 8)}...</span>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-neutral-700 font-medium rounded-lg border border-neutral-300 text-xs hover:bg-neutral-100"
          >
            Close
          </button>

          <Link
            href={`/daily-entry/${record._id}`}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg text-xs flex items-center space-x-1.5 shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Record</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
