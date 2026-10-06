'use client';
// components/ui/PeriodSelector.tsx
// Period selector tabs + custom date range — visible filter, no modal required
import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

export type Period =
  | 'today'
  | 'week'
  | 'month'
  | '6months'
  | 'year'
  | 'custom';

interface DateRange {
  from: string;
  to: string;
}

interface PeriodSelectorProps {
  value?: Period;
  selectedPeriod?: Period;
  dateRange?: DateRange;
  onChange?: (period: Period, dateRange?: DateRange) => void;
  onPeriodChange?: (period: Period) => void;
  onCustomDateChange?: (from: string, to: string) => void;
  id?: string;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: '6months', label: '6 Months' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom' },
];

export function PeriodSelector({
  value,
  selectedPeriod,
  dateRange,
  onChange,
  onPeriodChange,
  onCustomDateChange,
  id = 'period-selector',
}: PeriodSelectorProps) {
  const currentPeriod = selectedPeriod || value || 'month';
  const [showCustom, setShowCustom] = useState(currentPeriod === 'custom');
  const [customFrom, setCustomFrom] = useState(dateRange?.from ?? '');
  const [customTo, setCustomTo] = useState(dateRange?.to ?? '');

  useEffect(() => {
    setShowCustom(currentPeriod === 'custom');
  }, [currentPeriod]);

  useEffect(() => {
    if (dateRange?.from) setCustomFrom(dateRange.from);
    if (dateRange?.to) setCustomTo(dateRange.to);
  }, [dateRange?.from, dateRange?.to]);

  const handlePeriodClick = (p: Period) => {
    if (p === 'custom') {
      setShowCustom(true);
      if (onPeriodChange) onPeriodChange('custom');
      if (onChange) onChange('custom');
      return;
    }
    setShowCustom(false);
    if (onPeriodChange) onPeriodChange(p);
    if (onChange) onChange(p);
  };

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      if (onCustomDateChange) onCustomDateChange(customFrom, customTo);
      if (onChange) onChange('custom', { from: customFrom, to: customTo });
    }
  };

  return (
    <div className="space-y-2" id={id}>
      <div
        className="flex flex-wrap gap-1 p-1 bg-neutral-100 rounded-lg w-fit"
        role="tablist"
        aria-label="Select time period"
      >
        {PERIODS.map((p) => (
          <button
            key={p.value}
            role="tab"
            aria-selected={currentPeriod === p.value}
            onClick={() => handlePeriodClick(p.value)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
              ${
                currentPeriod === p.value
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
              }
            `}
          >
            {p.value === 'custom' && (
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom date range inputs */}
      {showCustom && (
        <div className="flex items-center gap-2 flex-wrap">
          <div>
            <label htmlFor="custom-from" className="sr-only">
              Start date
            </label>
            <input
              id="custom-from"
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="text-sm rounded-lg border border-neutral-200 px-3 py-2 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Start date"
            />
          </div>
          <span className="text-neutral-400 text-sm">to</span>
          <div>
            <label htmlFor="custom-to" className="sr-only">
              End date
            </label>
            <input
              id="custom-to"
              type="date"
              value={customTo}
              min={customFrom}
              onChange={(e) => setCustomTo(e.target.value)}
              className="text-sm rounded-lg border border-neutral-200 px-3 py-2 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="End date"
            />
          </div>
          <button
            onClick={handleCustomApply}
            disabled={!customFrom || !customTo}
            className="px-3 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
