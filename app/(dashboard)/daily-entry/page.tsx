// app/(dashboard)/daily-entry/page.tsx
// Daily Entry page for creating a new operational daily record
import type { Metadata } from 'next';
import { DailyEntryForm } from '@/components/forms/DailyEntryForm';

export const metadata: Metadata = {
  title: 'New Daily Entry — Singam Portal',
};

export default function DailyEntryPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">New Daily Operational Record</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Record bus odometer, fuel refills, staff assignment, and trip expenses.
        </p>
      </div>

      <DailyEntryForm />
    </div>
  );
}
