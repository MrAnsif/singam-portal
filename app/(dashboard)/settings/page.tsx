'use client';
// app/(dashboard)/settings/page.tsx
// Owner Settings Page for Fleet Buses, Staff, and System Configurations
import { useState, useEffect } from 'react';
import { Bus, Users, ShieldCheck, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [buses, setBuses] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New bus form
  const [newPlate, setNewPlate] = useState('');
  const [newName, setNewName] = useState('');
  const [addingBus, setAddingBus] = useState(false);

  // New staff form
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState<'driver' | 'attendant'>('driver');
  const [staffSalary, setStaffSalary] = useState<number | ''>('');
  const [addingStaff, setAddingStaff] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [busesRes, staffRes] = await Promise.all([
        fetch('/api/buses'),
        fetch('/api/staff'),
      ]);
      const bJson = await busesRes.json();
      const sJson = await staffRes.json();
      const bList = bJson.success ? bJson.data : Array.isArray(bJson) ? bJson : bJson.data || [];
      const sList = sJson.success ? sJson.data : Array.isArray(sJson) ? sJson : sJson.data || [];
      setBuses(bList);
      setStaff(sList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate) return;
    setAddingBus(true);
    try {
      const res = await fetch('/api/buses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plateNumber: newPlate, name: newName }),
      });
      const json = await res.json();
      if (res.ok && (json.success || json._id || json.data)) {
        toast.success(`Bus ${newPlate} added successfully`);
        setNewPlate('');
        setNewName('');
        fetchData();
      } else {
        toast.error(json.error || 'Failed to add bus');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to connect to server');
    } finally {
      setAddingBus(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName) return;
    setAddingStaff(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: staffName,
          phone: staffPhone,
          role: staffRole,
          monthlySalary: Number(staffSalary) || 0,
        }),
      });
      const json = await res.json();
      if (res.ok && (json.success || json._id || json.data)) {
        toast.success(`${staffRole === 'driver' ? 'Driver' : 'Attendant'} ${staffName} added successfully`);
        setStaffName('');
        setStaffPhone('');
        setStaffSalary('');
        fetchData();
      } else {
        toast.error(json.error || 'Failed to add staff');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to connect to server');
    } finally {
      setAddingStaff(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">System Settings & Fleet Config</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Manage bus vehicle fleet, staff profiles, and administrative defaults.
        </p>
      </div>

      {/* Grid: Bus Management & Staff Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fleet Buses Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 flex items-center space-x-2">
            <Bus className="w-4 h-4 text-brand-600" />
            <span>Manage Fleet Buses</span>
          </h2>

          <form onSubmit={handleAddBus} className="p-3 bg-neutral-50 rounded-xl space-y-3 text-xs">
            <h3 className="font-semibold text-neutral-800">Add New Bus</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Plate No (e.g. KL 07 CA 1234)"
                value={newPlate}
                onChange={(e) => setNewPlate(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white"
              />
              <input
                type="text"
                placeholder="Bus Name (Optional)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={addingBus}
              className="w-full py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{addingBus ? 'Adding...' : 'Add Bus'}</span>
            </button>
          </form>

          {/* Bus List */}
          <div className="divide-y divide-neutral-100 max-h-56 overflow-y-auto text-xs">
            {buses.map((b) => (
              <div key={b._id} className="py-2 flex items-center justify-between">
                <div>
                  <span className="font-bold text-neutral-900">{b.plateNumber}</span>
                  {b.name && <span className="text-neutral-500 ml-1">({b.name})</span>}
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Members Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 flex items-center space-x-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span>Manage Staff Members</span>
          </h2>

          <form onSubmit={handleAddStaff} className="p-3 bg-neutral-50 rounded-xl space-y-3 text-xs">
            <h3 className="font-semibold text-neutral-800">Add New Driver / Attendant</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Staff Full Name"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={staffPhone}
                onChange={(e) => setStaffPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white"
              >
                <option value="driver">Driver</option>
                <option value="attendant">Attendant</option>
              </select>
              <input
                type="number"
                placeholder="Monthly Salary (₹)"
                value={staffSalary}
                onChange={(e) => setStaffSalary(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={addingStaff}
              className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{addingStaff ? 'Adding...' : 'Add Staff Member'}</span>
            </button>
          </form>

          {/* Staff List */}
          <div className="divide-y divide-neutral-100 max-h-56 overflow-y-auto text-xs">
            {staff.map((s) => (
              <div key={s._id} className="py-2 flex items-center justify-between">
                <div>
                  <span className="font-bold text-neutral-900">{s.name}</span>
                  <span className="capitalize text-neutral-500 ml-1.5">({s.role})</span>
                </div>
                <span className="font-medium text-neutral-700">₹{(s.monthlySalary || 0).toLocaleString('en-IN')}/mo</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
