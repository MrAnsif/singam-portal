'use client';
// components/buses/BusCard.tsx
// Bus overview card showing plate number, assigned staff, status, and performance metrics
import Link from 'next/link';
import { Bus, UserCheck, Gauge, ArrowRight } from 'lucide-react';

interface BusCardProps {
  bus: {
    _id: string;
    plateNumber: string;
    name?: string;
    status: 'active' | 'inactive';
    defaultDriverId?: { name?: string };
    defaultAttendantId?: { name?: string };
  };
  stats?: {
    totalKm?: number;
    totalExpense?: number;
    costPerKm?: number;
  };
}

export function BusCard({ bus, stats }: BusCardProps) {
  const driverName =
    typeof bus.defaultDriverId === 'object' && bus.defaultDriverId?.name
      ? bus.defaultDriverId.name
      : 'Not assigned';

  const attendantName =
    typeof bus.defaultAttendantId === 'object' && bus.defaultAttendantId?.name
      ? bus.defaultAttendantId.name
      : 'Not assigned';

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-brand-300 transition-all">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900">{bus.plateNumber}</h3>
              <p className="text-xs text-neutral-500">{bus.name || 'Fleet Bus'}</p>
            </div>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              bus.status === 'active'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {bus.status}
          </span>
        </div>

        {/* Staff assignments */}
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-neutral-500">Default Driver:</span>
            <span className="font-semibold text-neutral-900">{driverName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Default Attendant:</span>
            <span className="font-semibold text-neutral-900">{attendantName}</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="pt-2 border-t border-neutral-100 text-xs">
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase">Distance Logged</span>
            <span className="font-bold text-neutral-900">{(stats.totalKm || 0).toLocaleString('en-IN')} KM</span>
          </div>
        </div>
      )}

      <Link
        href={`/buses/${bus._id}`}
        className="w-full py-2 bg-neutral-50 hover:bg-brand-50 text-neutral-700 hover:text-brand-700 font-semibold text-xs rounded-lg border border-neutral-200 hover:border-brand-200 flex items-center justify-center space-x-1 transition-colors"
      >
        <span>View Bus Analytics</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
