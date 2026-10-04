// components/dashboard/RecentActivity.tsx
// Table showing recent daily records entries on dashboard
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ArrowRight, Bus } from 'lucide-react';
import { format } from 'date-fns';

interface RecordItem {
  _id: string;
  date: string;
  busId?: { plateNumber?: string } | string;
  travelledKm: number;
  diesel: { total: number };
  adblue: { total: number };
  otherExpenses: { amount: number }[];
  status: 'draft' | 'complete' | 'edited';
  createdBy?: { name?: string };
}

interface RecentActivityProps {
  records: RecordItem[];
}

export function RecentActivity({ records }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900">Recent Daily Records</h3>
        <Link
          href="/records"
          className="text-xs text-brand-600 font-medium hover:underline flex items-center space-x-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {records.length === 0 ? (
        <p className="text-xs text-neutral-400 py-6 text-center">
          No records submitted yet for this period.
        </p>
      ) : (
        <div className="divide-y divide-neutral-100 overflow-x-auto">
          {records.map((r) => {
            const busPlate =
              typeof r.busId === 'object' && r.busId?.plateNumber
                ? r.busId.plateNumber
                : 'Bus';
            const totalExp =
              (r.diesel?.total || 0) +
              (r.adblue?.total || 0) +
              (r.otherExpenses?.reduce((s, e) => s + e.amount, 0) || 0);

            return (
              <div
                key={r._id}
                className="py-3 flex items-center justify-between text-xs hover:bg-neutral-50/50 rounded-lg px-1 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600">
                    <Bus className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{busPlate}</p>
                    <p className="text-neutral-500">
                      {format(new Date(r.date), 'dd MMM yyyy')} • {r.travelledKm} km
                    </p>
                  </div>
                </div>

                <div className="text-right flex items-center space-x-3">
                  <div>
                    <p className="font-semibold text-neutral-900">
                      ₹{totalExp.toLocaleString('en-IN')}
                    </p>
                    <p className="text-neutral-400 text-[11px]">
                      By {r.createdBy?.name || 'Staff'}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
