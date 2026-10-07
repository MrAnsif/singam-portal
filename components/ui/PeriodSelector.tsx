'use client';
// components/ui/PeriodSelector.tsx
// Single-bar Period Selector with integrated Shadcn Date Range Picker popover
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { type DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export type Period =
  | 'today'
  | 'week'
  | 'month'
  | '6months'
  | 'year'
  | 'custom';

interface DateRangeStrings {
  from: string;
  to: string;
}

interface PeriodSelectorProps {
  value?: Period;
  selectedPeriod?: Period;
  dateRange?: DateRangeStrings;
  onChange?: (period: Period, dateRange?: DateRangeStrings) => void;
  onPeriodChange?: (period: Period) => void;
  onCustomDateChange?: (from: string, to: string) => void;
  id?: string;
}

const PRESET_PERIODS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: '6months', label: '6 Months' },
  { value: 'year', label: 'This Year' },
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
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const parseDateStr = (dateStr?: string) => {
    if (!dateStr) return undefined;
    const parsed = parseISO(dateStr);
    return isValid(parsed) ? parsed : undefined;
  };

  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(() => ({
    from: parseDateStr(dateRange?.from),
    to: parseDateStr(dateRange?.to),
  }));

  useEffect(() => {
    setSelectedRange({
      from: parseDateStr(dateRange?.from),
      to: parseDateStr(dateRange?.to),
    });
  }, [dateRange?.from, dateRange?.to]);

  const handlePresetClick = (p: Period) => {
    setPopoverOpen(false);
    if (onPeriodChange) onPeriodChange(p);
    if (onChange) onChange(p);
  };

  const handleCustomRangeSelect = (range: DateRange | undefined) => {
    setSelectedRange(range);
    if (range?.from && range?.to) {
      const fromStr = format(range.from, 'yyyy-MM-dd');
      const toStr = format(range.to, 'yyyy-MM-dd');

      if (onPeriodChange) onPeriodChange('custom');
      if (onCustomDateChange) onCustomDateChange(fromStr, toStr);
      if (onChange) onChange('custom', { from: fromStr, to: toStr });
    }
  };

  const isCustomActive = currentPeriod === 'custom';

  const customLabel = useMemo(() => {
    if (isCustomActive && selectedRange?.from) {
      if (selectedRange.to) {
        return `${format(selectedRange.from, 'dd MMM')} - ${format(selectedRange.to, 'dd MMM')}`;
      }
      return format(selectedRange.from, 'dd MMM yyyy');
    }
    return 'Custom';
  }, [isCustomActive, selectedRange]);

  return (
    <div
      className="flex overflow-x-auto gap-1 p-1 bg-neutral-100 rounded-lg w-full md:w-fit sm:no-scrollbar"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      role="tablist"
      aria-label="Select time period"
      id={id}
    >
      {PRESET_PERIODS.map((p) => (
        <button
          key={p.value}
          role="tab"
          aria-selected={currentPeriod === p.value}
          onClick={() => handlePresetClick(p.value)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer
            ${
              currentPeriod === p.value
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
            }
          `}
        >
          {p.label}
        </button>
      ))}

      {/* Direct Custom Tab Button acting as Popover Trigger */}
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            role="tab"
            aria-selected={isCustomActive}
            onClick={() => {
              if (onPeriodChange) onPeriodChange('custom');
              if (onChange) onChange('custom');
            }}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer
              ${
                isCustomActive
                  ? 'bg-white text-brand-700 shadow-xs font-semibold border border-brand-200'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
              }
            `}
          >
            <CalendarIcon className="w-3.5 h-3.5 text-brand-600" aria-hidden="true" />
            <span>{customLabel}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            defaultMonth={selectedRange?.from || new Date()}
            selected={selectedRange}
            onSelect={handleCustomRangeSelect}
            numberOfMonths={isMobile ? 1 : 2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
