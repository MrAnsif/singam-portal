'use client';
// components/layout/Header.tsx
// Top navigation bar — logo, search, notifications, user menu
import { signOut } from 'next-auth/react';
import { Menu, Bell, LogOut, ChevronDown, Search } from 'lucide-react';
import { useState } from 'react';
import type { Session } from 'next-auth';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface HeaderProps {
  session: Session;
  onMenuClick: () => void;
}

export function Header({ session, onMenuClick }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const initials = session.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : 'U';

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center px-4 gap-4 shrink-0 print:hidden">
      {/* Hamburger (mobile/tablet) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-sm">
        <label htmlFor="global-search" className="sr-only">
          Search buses, staff, records
        </label>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="global-search"
            type="search"
            placeholder="Search buses, staff, records…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto">
        <ThemeToggle />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-sm"
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
            id="user-menu-button"
          >
            {/* Avatar */}
            <span
              className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0"
              aria-hidden="true"
            >
              {initials}
            </span>
            <span className="hidden sm:block font-medium text-neutral-700 max-w-24 truncate">
              {session.user?.name ?? 'User'}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                userMenuOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setUserMenuOpen(false)}
                aria-hidden="true"
              />
              <div
                role="menu"
                aria-labelledby="user-menu-button"
                className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg border border-neutral-200 shadow-md z-20 py-1"
              >
                <div className="px-4 py-2.5 border-b border-neutral-100">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {session.user?.name}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">
                    {session.user?.email}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    role="menuitem"
                    onClick={handleSignOut}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-danger-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
