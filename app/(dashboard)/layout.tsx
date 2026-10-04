// app/(dashboard)/layout.tsx
// Dashboard group layout — auth guard + AppShell
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <AppShell session={session}>{children}</AppShell>;
}
