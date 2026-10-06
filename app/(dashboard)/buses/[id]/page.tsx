// app/(dashboard)/buses/[id]/page.tsx
// Bus detail analytics view (Next.js 16 async params)
import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import { Bus, DailyRecord } from '@/lib/models';
import { notFound } from 'next/navigation';
import { DailyRecordsTable } from '@/components/tables/DailyRecordsTable';
import { Bus as BusIcon, Fuel, Gauge, Wallet, UserCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Bus Details — Singam Portal',
};

interface BusDetailProps {
  params: Promise<{ id: string }>;
}

export default async function BusDetailPage({ params }: BusDetailProps) {
  const { id } = await params;

  await connectDB();
  const [bus, records] = await Promise.all([
    Bus.findById(id).populate('defaultDriverId').populate('defaultAttendantId').lean(),
    DailyRecord.find({ busId: id }).sort({ date: -1 }).limit(50).populate('busId').populate('driverId').lean(),
  ]);

  if (!bus) {
    notFound();
  }

  const serializedBus = JSON.parse(JSON.stringify(bus));
  const serializedRecords = JSON.parse(JSON.stringify(records));

  const totalKm = serializedRecords.reduce((s: number, r: any) => s + (r.travelledKm || 0), 0);
  const totalDieselL = serializedRecords.reduce((s: number, r: any) => s + (r.diesel?.qty || 0), 0);
  const totalDieselCost = serializedRecords.reduce((s: number, r: any) => s + (r.diesel?.total || 0), 0);
  const totalAdblueCost = serializedRecords.reduce((s: number, r: any) => s + (r.adblue?.total || 0), 0);
  const totalOther = serializedRecords.reduce(
    (s: number, r: any) => s + (r.otherExpenses?.reduce((es: number, e: any) => es + (e.amount || 0), 0) || 0),
    0
  );
  const grandTotalExp = totalDieselCost + totalAdblueCost + totalOther;

  const kmPerL = totalDieselL > 0 ? (totalKm / totalDieselL).toFixed(2) : '0';

  return (
    <div className="space-y-6">
      {/* Bus Info Header Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-xl">
            <BusIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{serializedBus.plateNumber}</h1>
            <p className="text-xs text-neutral-500 mt-1">
              {serializedBus.name || 'Fleet Bus'}
            </p>
          </div>
        </div>
      </div>

      {/* Bus KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-neutral-500 font-medium">Distance Logged</span>
          <p className="text-xl font-bold text-neutral-900 mt-1">{totalKm.toLocaleString('en-IN')} KM</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-neutral-500 font-medium">Total Operating Cost</span>
          <p className="text-xl font-bold text-neutral-900 mt-1">₹{grandTotalExp.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-neutral-500 font-medium">Fuel Efficiency</span>
          <p className="text-xl font-bold text-blue-900 mt-1">{kmPerL} KM/L</p>
        </div>
      </div>

      {/* History Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-neutral-900">Bus Operating History</h2>
        <DailyRecordsTable records={serializedRecords} />
      </div>
    </div>
  );
}
