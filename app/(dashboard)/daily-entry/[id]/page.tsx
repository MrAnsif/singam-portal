// app/(dashboard)/daily-entry/[id]/page.tsx
// Edit screen for an existing daily record (Next.js 16 async params)
import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import { DailyRecord } from '@/lib/models';
import { DailyEntryForm } from '@/components/forms/DailyEntryForm';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Edit Daily Record — Singam Portal',
};

interface EditDailyEntryProps {
  params: Promise<{ id: string }>;
}

export default async function EditDailyEntryPage({ params }: EditDailyEntryProps) {
  const { id } = await params;

  await connectDB();
  const record = await DailyRecord.findById(id).populate('busId').populate('driverId').populate('attendantId').lean();

  if (!record) {
    notFound();
  }

  const serialized = JSON.parse(JSON.stringify(record));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Edit Operational Record</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Updating record ID: {id}
        </p>
      </div>

      <DailyEntryForm initialData={serialized} recordId={id} />
    </div>
  );
}
