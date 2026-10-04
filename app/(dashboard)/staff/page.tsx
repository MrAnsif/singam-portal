// app/(dashboard)/staff/page.tsx
// Staff Management view for Drivers and Attendants
import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import { Staff } from '@/lib/models';
import { StaffCard } from '@/components/staff/StaffCard';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Staff Management — Singam Portal',
};

export default async function StaffPage() {
  await connectDB();
  const staff = await Staff.find({})
    .populate('busId', 'plateNumber')
    .sort({ name: 1 })
    .lean();

  const serialized = JSON.parse(JSON.stringify(staff));

  const drivers = serialized.filter((s: any) => s.role === 'driver');
  const attendants = serialized.filter((s: any) => s.role === 'attendant');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Staff Management</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure bus drivers, attendants, and monthly salary baseline configurations.
          </p>
        </div>

        <Link
          href="/settings"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </Link>
      </div>

      {/* Drivers Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-neutral-900 flex items-center space-x-2">
          <span>Drivers ({drivers.length})</span>
        </h2>
        {drivers.length === 0 ? (
          <p className="text-xs text-neutral-400 py-4">No drivers configured.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((d: any) => (
              <StaffCard key={d._id} member={d} />
            ))}
          </div>
        )}
      </div>

      {/* Attendants Section */}
      <div className="space-y-3 pt-4">
        <h2 className="text-sm font-bold text-neutral-900 flex items-center space-x-2">
          <span>Attendants / Cleaners ({attendants.length})</span>
        </h2>
        {attendants.length === 0 ? (
          <p className="text-xs text-neutral-400 py-4">No attendants configured.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {attendants.map((a: any) => (
              <StaffCard key={a._id} member={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
