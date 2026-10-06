'use client';

import * as React from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { type DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerWithRangeProps {
  className?: string;
  from?: string;
  to?: string;
  onSelectRange?: (from: string, to: string) => void;
}

export function DatePickerWithRange({
  className,
  from,
  to,
  onSelectRange,
}: DatePickerWithRangeProps) {
  const parseDateStr = (dateStr?: string) => {
    if (!dateStr) return undefined;
    const parsed = parseISO(dateStr);
    return isValid(parsed) ? parsed : undefined;
  };

  const [date, setDate] = React.useState<DateRange | undefined>(() => ({
    from: parseDateStr(from),
    to: parseDateStr(to),
  }));

  React.useEffect(() => {
    const nextFrom = parseDateStr(from);
    const nextTo = parseDateStr(to);
    setDate({ from: nextFrom, to: nextTo });
  }, [from, to]);

  const handleSelect = (selectedRange: DateRange | undefined) => {
    setDate(selectedRange);
    if (selectedRange?.from && selectedRange?.to && onSelectRange) {
      const fromStr = format(selectedRange.from, 'yyyy-MM-dd');
      const toStr = format(selectedRange.to, 'yyyy-MM-dd');
      onSelectRange(fromStr, toStr);
    }
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date-picker-range"
            variant="outline"
            className={cn(
              'w-fit justify-start text-left font-normal text-xs px-3 py-2 bg-white border-neutral-200 shadow-xs hover:bg-neutral-50 text-neutral-800',
              !date && 'text-neutral-500'
            )}
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-neutral-500 shrink-0" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick custom date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from || new Date()}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
