// app/(dashboard)/change-logs/page.tsx
// Owner-only page displaying the AuditLog trail for accountability
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ChangeLogsTable } from '@/components/tables/ChangeLogsTable';
import { History, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Change Logs',
};

export default async function ChangeLogsPage() {
  const session = await auth();

  // Guard: Owner only
  if (session?.user?.role !== 'owner') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <History className="w-6 h-6 text-brand-600" />
            Audit Change Logs
          </h1>
          <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Immutable ledger of all data modifications and deletions
          </p>
        </div>
      </div>

      <ChangeLogsTable />
    </div>
  );
}
