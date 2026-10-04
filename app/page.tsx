// app/page.tsx
// Root route — automatically redirects logged-in users to /dashboard and unauthenticated users to /login
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await auth();
  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
