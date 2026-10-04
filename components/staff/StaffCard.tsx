'use client';
// components/staff/StaffCard.tsx
// Staff card detailing drivers and attendants with monthly salary configurations
import { UserCheck, Phone, Bus, Wallet } from 'lucide-react';

interface StaffCardProps {
  member: {
    _id: string;
    name: string;
    phone?: string;
    role: 'driver' | 'attendant';
    busId?: { plateNumber?: string };
    monthlySalary: number;
    status: 'active' | 'inactive';
  };
}

export function StaffCard({ member }: StaffCardProps) {
  const busPlate =
    typeof member.busId === 'object' && member.busId?.plateNumber
      ? member.busId.plateNumber
      : 'Unassigned';

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-brand-300 transition-all">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                member.role === 'driver' ? 'bg-brand-600' : 'bg-purple-600'
              }`}
            >
              {member.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900">{member.name}</h3>
              <span className="capitalize text-xs font-semibold text-neutral-500">{member.role}</span>
            </div>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              member.status === 'active'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {member.status}
          </span>
        </div>

        <div className="mt-4 p-3 bg-neutral-50 rounded-lg space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              <span>Phone:</span>
            </span>
            <span className="font-medium text-neutral-900">{member.phone || '—'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-500 flex items-center space-x-1">
              <Bus className="w-3.5 h-3.5 text-neutral-400" />
              <span>Assigned Bus:</span>
            </span>
            <span className="font-semibold text-neutral-900">{busPlate}</span>
          </div>

          <div className="flex items-center justify-between border-t border-neutral-200 pt-1.5">
            <span className="text-neutral-500 flex items-center space-x-1">
              <Wallet className="w-3.5 h-3.5 text-neutral-400" />
              <span>Configured Salary:</span>
            </span>
            <span className="font-bold text-neutral-900">
              ₹{(member.monthlySalary || 0).toLocaleString('en-IN')}/mo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
