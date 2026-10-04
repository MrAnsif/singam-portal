'use client';
// components/forms/BookingsSection.tsx
// Dynamic array of trip bookings (revenue vs cost)
import { Plus, Trash2, Ticket } from 'lucide-react';

export interface BookingInput {
  reference?: string;
  customerGroup?: string;
  revenue: number;
  cost: number;
  notes?: string;
}

interface BookingsSectionProps {
  bookings: BookingInput[];
  onChange: (bookings: BookingInput[]) => void;
}

export function BookingsSection({ bookings, onChange }: BookingsSectionProps) {
  const addBooking = () => {
    onChange([
      ...bookings,
      { reference: '', customerGroup: '', revenue: 0, cost: 0, notes: '' },
    ]);
  };

  const removeBooking = (index: number) => {
    onChange(bookings.filter((_, i) => i !== index));
  };

  const updateBooking = (index: number, field: keyof BookingInput, val: any) => {
    const updated = [...bookings];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.revenue) || 0), 0);
  const totalCost = bookings.reduce((sum, b) => sum + (Number(b.cost) || 0), 0);
  const netContribution = totalRevenue - totalCost;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Ticket className="w-4 h-4 text-emerald-600" />
          <h3 className="font-semibold text-neutral-900 text-sm">Trip Bookings / Hires</h3>
        </div>
        <button
          type="button"
          onClick={addBooking}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Booking</span>
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-4 border border-dashed border-neutral-200 rounded-lg text-xs text-neutral-400">
          No bookings added for this trip. Click &quot;Add Booking&quot; if there was a trip hire.
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-xs"
            >
              <div className="sm:col-span-3">
                <label className="block font-medium text-neutral-700 mb-1">
                  Customer / Group
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wedding Group / Tour"
                  value={item.customerGroup || ''}
                  onChange={(e) => updateBooking(idx, 'customerGroup', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-medium text-neutral-700 mb-1">
                  Reference / Booking No
                </label>
                <input
                  type="text"
                  placeholder="e.g. BK-1092"
                  value={item.reference || ''}
                  onChange={(e) => updateBooking(idx, 'reference', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-neutral-700 mb-1">
                  Revenue (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={item.revenue || ''}
                  onChange={(e) => updateBooking(idx, 'revenue', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-neutral-700 mb-1">
                  Trip Cost (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={item.cost || ''}
                  onChange={(e) => updateBooking(idx, 'cost', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between space-x-2">
                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 block">Net</span>
                  <span className={`font-semibold ${netContribution >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ₹{(Number(item.revenue || 0) - Number(item.cost || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeBooking(idx)}
                  className="p-1 text-neutral-400 hover:text-rose-600 rounded-md"
                  title="Remove booking"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Totals Summary */}
          <div className="p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs font-medium text-emerald-900">
            <span>Bookings Total: {bookings.length}</span>
            <div className="space-x-4">
              <span>Revenue: <strong>₹{totalRevenue.toLocaleString('en-IN')}</strong></span>
              <span>Net: <strong>₹{netContribution.toLocaleString('en-IN')}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
