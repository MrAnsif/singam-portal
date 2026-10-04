'use client';
// components/forms/OtherExpensesSection.tsx
// Dynamic list of additional expenses (toll, parking, cleaning, maintenance, etc.)
import { Plus, Trash2, Receipt } from 'lucide-react';

export interface ExpenseInput {
  category: string;
  amount: number;
  note?: string;
}

interface OtherExpensesSectionProps {
  expenses: ExpenseInput[];
  onChange: (expenses: ExpenseInput[]) => void;
}

const CATEGORIES = [
  'Toll',
  'Parking',
  'Cleaning',
  'Maintenance / Repair',
  'Police / Fine',
  'Driver Allowance',
  'Miscellaneous',
];

export function OtherExpensesSection({ expenses, onChange }: OtherExpensesSectionProps) {
  const addExpense = () => {
    onChange([...expenses, { category: 'Toll', amount: 0, note: '' }]);
  };

  const removeExpense = (index: number) => {
    onChange(expenses.filter((_, i) => i !== index));
  };

  const updateExpense = (index: number, field: keyof ExpenseInput, val: any) => {
    const updated = [...expenses];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };

  const totalOther = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Receipt className="w-4 h-4 text-amber-600" />
          <h3 className="font-semibold text-neutral-900 text-sm">Other Operational Expenses</h3>
        </div>
        <button
          type="button"
          onClick={addExpense}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Expense</span>
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-4 border border-dashed border-neutral-200 rounded-lg text-xs text-neutral-400">
          No additional expenses added (e.g. Tolls, Parking). Click &quot;Add Expense&quot; if applicable.
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-xs"
            >
              <div className="sm:col-span-4">
                <label className="block font-medium text-neutral-700 mb-1">
                  Category
                </label>
                <select
                  value={item.category}
                  onChange={(e) => updateExpense(idx, 'category', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-medium text-neutral-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={item.amount || ''}
                  onChange={(e) => updateExpense(idx, 'amount', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block font-medium text-neutral-700 mb-1">
                  Note / Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Expressway Toll"
                  value={item.note || ''}
                  onChange={(e) => updateExpense(idx, 'note', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end pb-1">
                <button
                  type="button"
                  onClick={() => removeExpense(idx)}
                  className="p-1 text-neutral-400 hover:text-rose-600 rounded-md"
                  title="Remove expense"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="p-2.5 bg-amber-50/50 border border-amber-200 rounded-lg flex items-center justify-between text-xs font-medium text-amber-900">
            <span>Other Expenses Total</span>
            <span><strong>₹{totalOther.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
