// app/(dashboard)/buses/page.tsx
// Fleet Buses overview page
import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import { Bus } from '@/lib/models';
import { BusesClient } from '@/components/buses/BusesClient';

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
      <BusesClient initialBuses={serialized} />
    </div>
  );
}
