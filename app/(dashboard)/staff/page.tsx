// app/(dashboard)/staff/page.tsx
// Staff Management view for Drivers and Attendants
import type { Metadata } from 'next';
import { connectDB } from '@/lib/mongodb';
import { Staff } from '@/lib/models';
import { StaffClient } from '@/components/staff/StaffClient';

export const metadata: Metadata = {
  title: 'Staff Management — Singam Portal',
};

export default async function StaffPage() {
  await connectDB();
  const staff = await Staff.find({})
    .sort({ name: 1 })
    .lean();

  const serialized = JSON.parse(JSON.stringify(staff));

  return (
    <div className="space-y-6">
      <StaffClient initialStaff={serialized} />
    </div>
  );
}
