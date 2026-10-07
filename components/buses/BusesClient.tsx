'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bus, Plus, Edit2, Trash2 } from 'lucide-react';
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
import { BusCard } from '@/components/buses/BusCard';

export function BusesClient({ initialBuses }: { initialBuses: any[] }) {
  const router = useRouter();

  // Form State
  const [isAddBusOpen, setIsAddBusOpen] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newName, setNewName] = useState('');
  const [addingBus, setAddingBus] = useState(false);

  // Edit / Delete State
  const [editingBus, setEditingBus] = useState<any>(null);
  const [deletingBus, setDeletingBus] = useState<any>(null);

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
        setIsAddBusOpen(false);
        router.refresh();
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
        router.refresh();
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
        router.refresh();
      } else {
        toast.error('Failed to delete bus');
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
          <h1 className="text-xl font-bold text-neutral-900">Fleet Buses</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Overview of fleet bus vehicles and operational performance stats.
          </p>
        </div>
        <button
          onClick={() => setIsAddBusOpen(true)}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Bus</span>
        </button>
      </div>

      {/* Main Grid */}
      <div>
        {initialBuses.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400 text-sm shadow-xs">
            No buses registered yet. Click &quot;Add New Bus&quot; to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {initialBuses.map((b: any) => (
              <div key={b._id} className="relative group">
                <BusCard bus={b} />
                <div className="absolute top-2 right-2 flex gap-1 transition-opacity">
                  <button
                    onClick={() => setEditingBus(b)}
                    className="p-1.5 bg-white text-neutral-500 hover:text-brand-600 shadow-sm transition-colors"
                    title="Edit Bus"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingBus(b)}
                    className="p-1.5 bg-white text-neutral-500 hover:text-red-600 shadow-sm transition-colors"
                    title="Delete Bus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Bus Dialog */}
      <Dialog open={isAddBusOpen} onOpenChange={setIsAddBusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bus className="w-5 h-5 text-brand-600" />
              Add New Bus
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddBus} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">Plate Number</label>
              <input
                type="text"
                placeholder="e.g. KL 07 CA 1234"
                value={newPlate}
                onChange={(e) => setNewPlate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-700">Bus Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Express One"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors text-sm"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddBusOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addingBus} className="bg-brand-600 hover:bg-brand-700 text-white">
                {addingBus ? 'Adding...' : 'Add Bus'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Bus Dialog */}
      <Dialog open={!!editingBus} onOpenChange={(open: boolean) => !open && setEditingBus(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bus</DialogTitle>
          </DialogHeader>
          {editingBus && (
            <form onSubmit={handleUpdateBus} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700">Plate Number</label>
                <input
                  type="text"
                  value={editingBus.plateNumber}
                  onChange={(e) => setEditingBus({ ...editingBus, plateNumber: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700">Bus Name (Optional)</label>
                <input
                  type="text"
                  value={editingBus.name || ''}
                  onChange={(e) => setEditingBus({ ...editingBus, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingBus(null)}>Cancel</Button>
                <Button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Bus Alert */}
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
            <AlertDialogAction onClick={handleDeleteBus} className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-500">
              Delete Bus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
