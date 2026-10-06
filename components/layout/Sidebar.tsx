'use client';
// components/layout/Sidebar.tsx
// Role-aware sidebar — shows different nav items for manager vs owner
// Uses usePathname() for active state detection (client component)
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  Receipt,
  Bookmark,
  Bus,
  Users,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const MANAGER_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/daily-entry', label: 'Daily Entry', icon: ClipboardList },
  { href: '/records', label: 'Records', icon: BookOpen },
];

const OWNER_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/records', label: 'Trips', icon: ClipboardList },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/bookings', label: 'Bookings', icon: Bookmark },
  { href: '/buses', label: 'Buses', icon: Bus },
  { href: '/staff', label: 'Staff', icon: Users },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  role: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === 'owner' ? OWNER_NAV : MANAGER_NAV;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/40 z-20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-white border-r border-neutral-200
          flex flex-col z-30 transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
              <Bus className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-neutral-900 text-[0.9375rem] leading-tight">
              Singam Portal
            </span>
          </div>
          {/* Close button (mobile) */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3 border-b border-neutral-100">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              role === 'owner'
                ? 'bg-brand-50 text-brand-700'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {role === 'owner' ? 'Owner View' : 'Manager View'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Sidebar navigation">
          <ul role="list" className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-100 group
                      ${
                        active
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                      }
                    `}
                  >
                    <Icon
                      className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                        active ? 'text-brand-600' : 'text-neutral-400 group-hover:text-neutral-600'
                      }`}
                      aria-hidden="true"
                    />
                    {item.label}
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" aria-hidden="true" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom: version */}
        <div className="px-5 py-3 border-t border-neutral-100">
          <p className="text-xs text-neutral-400">Singam Bus Services</p>
        </div>
      </aside>
    </>
  );
}
