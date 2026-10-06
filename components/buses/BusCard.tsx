'use client';
// components/buses/BusCard.tsx
// Bus overview card showing plate number, name, and performance metrics
import Link from 'next/link';
import { Bus, ArrowRight } from 'lucide-react';

interface BusCardProps {
  bus: {
    _id: string;
    plateNumber: string;
    name?: string;
    status?: string;
  };
  stats?: {
    totalKm?: number;
    totalExpense?: number;
    costPerKm?: number;
  };
}

export function BusCard({ bus, stats }: BusCardProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-brand-300 transition-all">
      <div>
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-neutral-900">{bus.plateNumber}</h3>
            <p className="text-xs text-neutral-500">{bus.name || 'Fleet Bus'}</p>
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
