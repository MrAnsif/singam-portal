// app/(dashboard)/dashboard/page.tsx
// Dashboard page — renders Owner or Manager view based on session role
import { auth } from '@/auth';
import { ManagerDashboard } from '@/components/dashboard/ManagerDashboard';
import { OwnerDashboard } from '@/components/dashboard/OwnerDashboard';
import type { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const session = await auth();
  const isOwner = session?.user?.role === 'owner';

  return isOwner ? <OwnerDashboard session={session!} /> : <ManagerDashboard session={session!} />;
}
