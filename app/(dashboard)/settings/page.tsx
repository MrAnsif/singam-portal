// app/(dashboard)/settings/page.tsx
// Placeholder settings page now that Staff and Buses have dedicated management pages
import Link from 'next/link';
import { Bus, Users, ArrowRight } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">System Settings & Fleet Config</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          General settings for the Singam Portal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          href="/buses"
          className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs hover:border-brand-300 hover:shadow-md transition-all group flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
            <Bus className="w-5 h-5 text-brand-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-neutral-900 group-hover:text-brand-700 transition-colors">Manage Fleet Buses</h2>
            <p className="text-xs text-neutral-500 mt-1">Add, edit, or remove fleet buses.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-brand-600 transition-colors mt-2" />
        </Link>

        <Link 
          href="/staff"
          className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs hover:border-purple-300 hover:shadow-md transition-all group flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-neutral-900 group-hover:text-purple-700 transition-colors">Manage Staff Members</h2>
            <p className="text-xs text-neutral-500 mt-1">Add, edit, or remove drivers and attendants.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-purple-600 transition-colors mt-2" />
        </Link>
      </div>
    </div>
  );
}
