// app/(auth)/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login — Singam Portal',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      {children}
    </div>
  );
}
