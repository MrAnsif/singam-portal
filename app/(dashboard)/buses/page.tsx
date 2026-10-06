// app/(dashboard)/buses/page.tsx
// Fleet Buses overview page
import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import { Bus } from '@/lib/models';
import { BusCard } from '@/components/buses/BusCard';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Fleet Buses — Singam Portal',
};

export default async function BusesPage() {
  await connectDB();
  const buses = await Bus.find({})
    .sort({ plateNumber: 1 })
    .lean();

  const serialized = JSON.parse(JSON.stringify(buses));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Fleet Buses</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Overview of fleet bus vehicles and operational performance stats.
          </p>
        </div>

        <Link
          href="/settings"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Bus</span>
        </Link>
      </div>

      {serialized.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400 text-xs">
          No buses registered yet. Go to Settings to add fleet buses.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {serialized.map((b: any) => (
            <BusCard key={b._id} bus={b} />
          ))}
        </div>
      )}
    </div>
  );
}
