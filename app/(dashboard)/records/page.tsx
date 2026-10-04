// app/(dashboard)/records/page.tsx
// Daily records list page with filters and details
import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import { DailyRecord } from '@/lib/models';
import { DailyRecordsTable } from '@/components/tables/DailyRecordsTable';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Daily Records — Singam Portal',
};

export default async function RecordsPage() {
  await connectDB();
  const records = await DailyRecord.find({})
    .sort({ date: -1 })
    .limit(100)
    .populate('busId', 'plateNumber')
    .populate('driverId', 'name')
    .populate('attendantId', 'name')
    .populate('createdBy', 'name')
    .lean();

  const serialized = JSON.parse(JSON.stringify(records));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Daily Operations Log</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            History of submitted daily bus logs, odometer readings, and expenses.
          </p>
        </div>

        <Link
          href="/daily-entry"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Daily Entry</span>
        </Link>
      </div>

      <DailyRecordsTable records={serialized} />
    </div>
  );
}
