'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Edit2, Trash2 } from 'lucide-react';
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
import { StaffCard } from '@/components/staff/StaffCard';

export function StaffClient({ initialStaff }: { initialStaff: any[] }) {
  const router = useRouter();

  const drivers = initialStaff.filter((s: any) => s.role === 'driver');
  const attendants = initialStaff.filter((s: any) => s.role === 'attendant');

  // Form State
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState<'driver' | 'attendant'>('driver');
  const [staffSalary, setStaffSalary] = useState<number | ''>('');
  const [addingStaff, setAddingStaff] = useState(false);

  // Edit / Delete State
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [deletingStaff, setDeletingStaff] = useState<any>(null);

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
        setIsAddStaffOpen(false);
        router.refresh();
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
        router.refresh();
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
        router.refresh();
      } else {
        toast.error('Failed to delete staff');
      }
    } catch {
      toast.error('Failed to connect to server');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Staff Management</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure bus drivers, attendants, and monthly salary baseline configurations.
          </p>
        </div>
        <button
          onClick={() => setIsAddStaffOpen(true)}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Main Content (Drivers and Attendants Grid) */}
      <div className="space-y-8">
        {/* Drivers Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-neutral-900 flex items-center space-x-2">
            <span>Drivers ({drivers.length})</span>
          </h2>
          {drivers.length === 0 ? (
            <p className="text-xs text-neutral-400 py-4">No drivers configured.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {drivers.map((d: any) => (
                <div key={d._id} className="relative group">
                  <StaffCard member={d} />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => setEditingStaff(d)}
                      className="p-1.5 bg-white text-neutral-500 hover:text-purple-600 shadow-sm transition-colors"
                      title="Edit Staff"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingStaff(d)}
                      className="p-1.5 bg-white text-neutral-500 hover:text-red-600 shadow-sm transition-colors"
                      title="Delete Staff"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendants Section */}
        <div className="space-y-3 pt-4 border-t border-neutral-100">
          <h2 className="text-sm font-bold text-neutral-900 flex items-center space-x-2">
            <span>Attendants / Cleaners ({attendants.length})</span>
          </h2>
          {attendants.length === 0 ? (
            <p className="text-xs text-neutral-400 py-4">No attendants configured.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {attendants.map((a: any) => (
                <div key={a._id} className="relative group">
                  <StaffCard member={a} />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => setEditingStaff(a)}
                      className="p-1.5 bg-white text-neutral-500 hover:text-purple-600 shadow-sm transition-colors"
                      title="Edit Staff"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingStaff(a)}
                      className="p-1.5 bg-white text-neutral-500 hover:text-red-600 shadow-sm transition-colors"
                      title="Delete Staff"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Add New Staff
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddStaff} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">Full Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">Phone Number (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 555-0101"
                value={staffPhone}
                onChange={(e) => setStaffPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700">Role</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
                >
                  <option value="driver">Driver</option>
                  <option value="attendant">Attendant</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700">Monthly Salary (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 3000"
                  value={staffSalary}
                  onChange={(e) => setStaffSalary(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddStaffOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addingStaff} className="bg-purple-600 hover:bg-purple-700 text-white">
                {addingStaff ? 'Adding...' : 'Add Staff'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={!!editingStaff} onOpenChange={(open: boolean) => !open && setEditingStaff(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          {editingStaff && (
            <form onSubmit={handleUpdateStaff} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-700">Full Name</label>
                  <input
                    type="text"
                    value={editingStaff.name}
                    onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-700">Phone Number</label>
                  <input
                    type="text"
                    value={editingStaff.phone || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-700">Role</label>
                  <select
                    value={editingStaff.role}
                    onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    <option value="driver">Driver</option>
                    <option value="attendant">Attendant</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-700">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={editingStaff.monthlySalary || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, monthlySalary: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingStaff(null)}>Cancel</Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Staff Alert */}
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
            <AlertDialogAction onClick={handleDeleteStaff} className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-500">
              Delete Staff
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
