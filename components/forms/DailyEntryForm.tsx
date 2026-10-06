'use client';
// components/forms/DailyEntryForm.tsx
// Core operational data-entry form with auto-calculations, smart defaults, draft persistence, and duplicate checks
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BookingsSection, type BookingInput } from './BookingsSection';
import { OtherExpensesSection, type ExpenseInput } from './OtherExpensesSection';
import {
  Bus,
  Calendar,
  Gauge,
  Fuel,
  Users,
  AlertTriangle,
  Save,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';
import { toast } from 'sonner';

interface DailyEntryFormProps {
  initialData?: any;
  recordId?: string;
}

export function DailyEntryForm({ initialData, recordId }: DailyEntryFormProps) {
  const router = useRouter();
  const isEditing = !!recordId;

  // Form State
  const [date, setDate] = useState<string>(
    initialData?.date
      ? new Date(initialData.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [busId, setBusId] = useState<string>(initialData?.busId?._id || initialData?.busId || '');
  const [driverId, setDriverId] = useState<string>(initialData?.driverId?._id || initialData?.driverId || '');
  const [attendantId, setAttendantId] = useState<string>(initialData?.attendantId?._id || initialData?.attendantId || '');

  // Simplified distance: just KM travelled (no opening/closing)
  const [travelledKm, setTravelledKm] = useState<number | ''>(
    initialData?.travelledKm ?? ''
  );

  // Diesel: quantity + total price paid
  const [dieselQty, setDieselQty] = useState<number | ''>(initialData?.diesel?.qty ?? '');
  const [dieselTotal, setDieselTotal] = useState<number | ''>(initialData?.diesel?.total ?? '');

  // AdBlue: quantity + total price paid
  const [adblueQty, setAdblueQty] = useState<number | ''>(initialData?.adblue?.qty ?? '');
  const [adblueTotal, setAdblueTotal] = useState<number | ''>(initialData?.adblue?.total ?? '');

  const [bookings, setBookings] = useState<BookingInput[]>(
    // Strip 'cost' field from existing data when editing
    (initialData?.bookings || []).map(({ cost: _cost, ...b }: any) => b)
  );
  const [otherExpenses, setOtherExpenses] = useState<ExpenseInput[]>(initialData?.otherExpenses || []);
  const [notes, setNotes] = useState<string>(initialData?.notes || '');

  // Options & Status
  const [buses, setBuses] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [draftPrompt, setDraftPrompt] = useState(false);

  // ─── Computed Totals ────────────────────────────────────────────────────────
  const dieselAmount = typeof dieselTotal === 'number' ? dieselTotal : 0;
  const adblueAmount = typeof adblueTotal === 'number' ? adblueTotal : 0;

  const otherExpensesTotal = otherExpenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0
  );

  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.revenue) || 0), 0);
  const totalExpense = dieselAmount + adblueAmount + otherExpensesTotal;
  const netAmount = totalRevenue - totalExpense;

  // 1. Fetch Buses and Staff on mount
  useEffect(() => {
    async function loadOptions() {
      try {
        const [busesRes, staffRes] = await Promise.all([
          fetch('/api/buses'),
          fetch('/api/staff'),
        ]);
        const busesData = await busesRes.json();
        const staffData = await staffRes.json();

        if (busesData.success) setBuses(busesData.data || []);
        if (staffData.success) setStaff(staffData.data || []);

        // Smart default: Select last used bus from localStorage if creating new
        if (!isEditing && !busId) {
          const lastBus = localStorage.getItem('singam_last_bus');
          if (lastBus && busesData.data?.some((b: any) => b._id === lastBus)) {
            setBusId(lastBus);
          } else if (busesData.data?.length > 0) {
            setBusId(busesData.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load options', err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, [isEditing, busId]);

  // 2. Auto-fill default driver/attendant when bus changes
  useEffect(() => {
    if (!busId || isEditing) return;

    // Save to localStorage for smart default next time
    localStorage.setItem('singam_last_bus', busId);

    const selectedBus = buses.find((b) => b._id === busId);
    if (selectedBus) {
      if (selectedBus.defaultDriverId) {
        setDriverId(
          typeof selectedBus.defaultDriverId === 'object'
            ? selectedBus.defaultDriverId._id
            : selectedBus.defaultDriverId
        );
      }
      if (selectedBus.defaultAttendantId) {
        setAttendantId(
          typeof selectedBus.defaultAttendantId === 'object'
            ? selectedBus.defaultAttendantId._id
            : selectedBus.defaultAttendantId
        );
      }
    }
  }, [busId, buses, isEditing]);

  // 3. Duplicate Record Check
  const checkDuplicate = useCallback(async () => {
    if (!busId || !date || isEditing) return;

    try {
      const res = await fetch(`/api/daily-records?busId=${busId}&from=${date}&to=${date}`);
      const json = await res.json();
      if (json.success && json.data?.records?.length > 0) {
        const existing = json.data.records[0];
        setDuplicateWarning(`A record for this bus on ${date} already exists (${existing.status}).`);
      } else {
        setDuplicateWarning(null);
      }
    } catch (e) {
      console.error(e);
    }
  }, [busId, date, isEditing]);

  useEffect(() => {
    checkDuplicate();
  }, [checkDuplicate]);

  // 4. Draft persistence check on mount
  useEffect(() => {
    if (isEditing) return;
    const savedDraft = localStorage.getItem('singam_daily_entry_draft');
    if (savedDraft) {
      setDraftPrompt(true);
    }
  }, [isEditing]);

  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem('singam_daily_entry_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.date) setDate(parsed.date);
        if (parsed.busId) setBusId(parsed.busId);
        if (parsed.driverId) setDriverId(parsed.driverId);
        if (parsed.attendantId) setAttendantId(parsed.attendantId);
        if (parsed.travelledKm !== undefined) setTravelledKm(parsed.travelledKm);
        if (parsed.dieselQty !== undefined) setDieselQty(parsed.dieselQty);
        if (parsed.dieselTotal !== undefined) setDieselTotal(parsed.dieselTotal);
        if (parsed.adblueQty !== undefined) setAdblueQty(parsed.adblueQty);
        if (parsed.adblueTotal !== undefined) setAdblueTotal(parsed.adblueTotal);
        if (parsed.bookings) setBookings(parsed.bookings);
        if (parsed.otherExpenses) setOtherExpenses(parsed.otherExpenses);
        if (parsed.notes) setNotes(parsed.notes);
        toast.success('Draft restored');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDraftPrompt(false);
    }
  };

  const discardDraft = () => {
    localStorage.removeItem('singam_daily_entry_draft');
    setDraftPrompt(false);
  };

  // Save state to draft on changes (if not editing)
  useEffect(() => {
    if (isEditing) return;
    const draftData = {
      date,
      busId,
      driverId,
      attendantId,
      travelledKm,
      dieselQty,
      dieselTotal,
      adblueQty,
      adblueTotal,
      bookings,
      otherExpenses,
      notes,
    };
    localStorage.setItem('singam_daily_entry_draft', JSON.stringify(draftData));
  }, [
    isEditing,
    date,
    busId,
    driverId,
    attendantId,
    travelledKm,
    dieselQty,
    dieselTotal,
    adblueQty,
    adblueTotal,
    bookings,
    otherExpenses,
    notes,
  ]);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!busId) {
      toast.error('Please select a bus');
      return;
    }

    setSubmitting(true);

    const payload = {
      date: new Date(date).toISOString(),
      busId,
      driverId: driverId || undefined,
      attendantId: attendantId || undefined,
      travelledKm: Number(travelledKm) || 0,
      diesel: {
        qty: Number(dieselQty) || 0,
        total: Number(dieselTotal) || 0,
      },
      adblue: {
        qty: Number(adblueQty) || 0,
        total: Number(adblueTotal) || 0,
      },
      bookings,
      otherExpenses,
      notes,
    };

    try {
      const url = isEditing ? `/api/daily-records/${recordId}` : '/api/daily-records';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        localStorage.removeItem('singam_daily_entry_draft');
        toast.success(isEditing ? 'Record updated successfully' : 'Daily record saved');
        router.push('/records');
      } else {
        toast.error(json.error || 'Failed to save record');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const drivers = staff.filter((s) => s.role === 'driver');
  const attendants = staff.filter((s) => s.role === 'attendant');

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      {/* Draft banner prompt */}
      {draftPrompt && (
        <div className="bg-brand-50 border border-brand-200 text-brand-900 p-4 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Unsaved draft found from your last session. Restore draft?</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={loadDraft}
              className="px-3 py-1 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700"
            >
              Restore Draft
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="px-3 py-1 bg-white text-neutral-600 font-medium rounded-lg border border-neutral-300 hover:bg-neutral-50"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Duplicate warning banner */}
      {duplicateWarning && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl flex items-center space-x-2 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{duplicateWarning} Editing existing record is recommended instead of duplicate submission.</span>
        </div>
      )}

      {/* SECTION 1: Date & Bus selection */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 flex items-center space-x-2">
          <Bus className="w-4 h-4 text-brand-600" />
          <span>Bus &amp; Date Details</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Select Bus *
            </label>
            <select
              value={busId}
              onChange={(e) => setBusId(e.target.value)}
              required
              disabled={loadingOptions}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- Choose Bus --</option>
              {buses.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.plateNumber} {b.name ? `(${b.name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Entry Date *
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Calendar className="w-4 h-4 text-neutral-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Distance Log */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-blue-600" />
          <span>Distance Log</span>
        </h2>

        <div className="max-w-xs">
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            Distance Travelled (KM)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g. 450"
            value={travelledKm}
            onChange={(e) => setTravelledKm(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <p className="text-[11px] text-neutral-400 mt-1">Total KM covered</p>
        </div>
      </div>

      {/* SECTION 3: Diesel & AdBlue */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 flex items-center space-x-2">
          <Fuel className="w-4 h-4 text-amber-600" />
          <span>Fuel &amp; AdBlue Refills</span>
        </h2>

        {/* Diesel Block */}
        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
          <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Diesel Refill</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                Quantity (Litres)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={dieselQty}
                onChange={(e) => setDieselQty(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                Total Price Paid (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={dieselTotal}
                onChange={(e) => setDieselTotal(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* AdBlue Block */}
        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
          <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">AdBlue Refill</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                Quantity (Litres)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={adblueQty}
                onChange={(e) => setAdblueQty(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                Total Price Paid (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={adblueTotal}
                onChange={(e) => setAdblueTotal(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Staff Assignment */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 flex items-center space-x-2">
          <Users className="w-4 h-4 text-purple-600" />
          <span>Staff Assigned To Trip</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Driver
            </label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs"
            >
              <option value="">-- Select Driver --</option>
              {drivers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} {d.phone ? `(${d.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Attendant / Cleaner
            </label>
            <select
              value={attendantId}
              onChange={(e) => setAttendantId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs"
            >
              <option value="">-- Select Attendant --</option>
              {attendants.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name} {a.phone ? `(${a.phone})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 5: Bookings Section */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <BookingsSection bookings={bookings} onChange={setBookings} />
      </div>

      {/* SECTION 6: Other Expenses */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <OtherExpensesSection expenses={otherExpenses} onChange={setOtherExpenses} />
      </div>

      {/* SECTION 7: Notes & Summary */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            Trip Notes / Remarks (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Traffic delay at toll, tyre pressure check done..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Summary Bar — Expense | Revenue | Net */}
        <div className="p-4 rounded-xl bg-brand-900 text-white space-y-3">
          {/* Three stat pills */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-brand-800/70 rounded-xl p-3">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-300">Expense</span>
              </div>
              <div className="text-lg font-black text-rose-300">
                ₹{totalExpense.toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-brand-400 mt-0.5">
                Diesel ₹{dieselAmount} · AdBlue ₹{adblueAmount} · Other ₹{otherExpensesTotal}
              </p>
            </div>

            <div className="bg-brand-800/70 rounded-xl p-3">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-300">Revenue</span>
              </div>
              <div className="text-lg font-black text-emerald-300">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-brand-400 mt-0.5">
                {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="bg-brand-800/70 rounded-xl p-3">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-300">Net</span>
              </div>
              <div className={`text-lg font-black ${netAmount >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                ₹{netAmount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3 pt-1">
            <button
              type="button"
              onClick={() => router.push('/records')}
              className="px-4 py-2.5 bg-brand-800 hover:bg-brand-700 text-brand-100 rounded-xl text-xs font-semibold w-1/2 text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-xs font-semibold shadow-md flex items-center justify-center space-x-2 w-1/2"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : isEditing ? 'Update Record' : 'Save Record'}</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
