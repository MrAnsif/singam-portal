'use client';
// app/(dashboard)/settings/page.tsx
// Owner Settings Page for Fleet Buses, Staff, and System Configurations
import { useState, useEffect } from 'react';
import { Bus, Users, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

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

  // Edit / Delete State
  const [editingBus, setEditingBus] = useState<any>(null);
  const [deletingBus, setDeletingBus] = useState<any>(null);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [deletingStaff, setDeletingStaff] = useState<any>(null);

  const handleUpdateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/buses/${editingBus._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plateNumber: editingBus.plateNumber, name: editingBus.name }),
      });
      if (res.ok) {
        toast.success('Bus updated successfully');
        setEditingBus(null);
        fetchData();
      } else {
        toast.error('Failed to update bus');
      }
    } catch {
      toast.error('Failed to connect to server');
    }
  };

  const handleDeleteBus = async () => {
    try {
      const res = await fetch(`/api/buses/${deletingBus._id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Bus deleted successfully');
        setDeletingBus(null);
        fetchData();
      } else {
        toast.error('Failed to delete bus');
      }
    } catch {
      toast.error('Failed to connect to server');
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/staff/${editingStaff._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingStaff.name,
          phone: editingStaff.phone,
          role: editingStaff.role,
          monthlySalary: Number(editingStaff.monthlySalary) || 0,
        }),
      });
      if (res.ok) {
        toast.success('Staff updated successfully');
        setEditingStaff(null);
        fetchData();
      } else {
        toast.error('Failed to update staff');
      }
    } catch {
      toast.error('Failed to connect to server');
    }
  };

  const handleDeleteStaff = async () => {
    try {
      const res = await fetch(`/api/staff/${deletingStaff._id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Staff deleted successfully');
        setDeletingStaff(null);
        fetchData();
      } else {
        toast.error('Failed to delete staff');
      }
    } catch {
      toast.error('Failed to connect to server');
    }
  };

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
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingBus(b)} className="p-1 text-neutral-400 hover:text-brand-600 transition-colors" title="Edit Bus">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeletingBus(b)} className="p-1 text-neutral-400 hover:text-red-600 transition-colors" title="Delete Bus">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-700">₹{(s.monthlySalary || 0).toLocaleString('en-IN')}/mo</span>
                  <button onClick={() => setEditingStaff(s)} className="p-1 text-neutral-400 hover:text-purple-600 transition-colors" title="Edit Staff">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeletingStaff(s)} className="p-1 text-neutral-400 hover:text-red-600 transition-colors" title="Delete Staff">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals for Edit and Delete */}
      
      {/* Bus Edit Dialog */}
      <Dialog open={!!editingBus} onOpenChange={(open: boolean) => !open && setEditingBus(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bus</DialogTitle>
          </DialogHeader>
          {editingBus && (
            <form onSubmit={handleUpdateBus} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700">Plate Number</label>
                <input
                  type="text"
                  value={editingBus.plateNumber}
                  onChange={(e) => setEditingBus({ ...editingBus, plateNumber: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700">Bus Name (Optional)</label>
                <input
                  type="text"
                  value={editingBus.name || ''}
                  onChange={(e) => setEditingBus({ ...editingBus, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingBus(null)}>Cancel</Button>
                <Button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Bus Delete Alert */}
      <AlertDialog open={!!deletingBus} onOpenChange={(open: boolean) => !open && setDeletingBus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the bus <strong>{deletingBus?.plateNumber}</strong>. Historical daily records associated with this bus will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBus} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Bus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Staff Edit Dialog */}
      <Dialog open={!!editingStaff} onOpenChange={(open: boolean) => !open && setEditingStaff(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          {editingStaff && (
            <form onSubmit={handleUpdateStaff} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-700">Full Name</label>
                  <input
                    type="text"
                    value={editingStaff.name}
                    onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-700">Phone Number</label>
                  <input
                    type="text"
                    value={editingStaff.phone || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-700">Role</label>
                  <select
                    value={editingStaff.role}
                    onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white"
                  >
                    <option value="driver">Driver</option>
                    <option value="attendant">Attendant</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-700">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={editingStaff.monthlySalary || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, monthlySalary: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingStaff(null)}>Cancel</Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Staff Delete Alert */}
      <AlertDialog open={!!deletingStaff} onOpenChange={(open: boolean) => !open && setDeletingStaff(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{deletingStaff?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStaff} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Staff
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
