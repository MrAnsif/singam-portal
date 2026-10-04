'use client';
// components/layout/AppShell.tsx
// The main application shell — sidebar + header + main content
// Manages mobile sidebar toggle state
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { Session } from 'next-auth';

interface AppShellProps {
  session: Session;
  children: React.ReactNode;
}

export function AppShell({ session, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Sidebar */}
      <Sidebar
        role={session.user?.role ?? 'manager'}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          session={session}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
