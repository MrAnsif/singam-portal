'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'react-day-picker/style.css';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-2 text-xs', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-3',
        month_caption: 'flex justify-between pt-1 items-center px-1 font-semibold text-neutral-800',
        caption_label: 'text-xs font-semibold text-neutral-900',
        nav: 'space-x-1 flex items-center',
        button_previous: 'h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 border border-neutral-200 rounded-lg flex items-center justify-center text-neutral-600 hover:bg-neutral-100',
        button_next: 'h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 border border-neutral-200 rounded-lg flex items-center justify-center text-neutral-600 hover:bg-neutral-100',
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday: 'text-neutral-400 rounded-md w-8 font-medium text-[0.7rem] text-center uppercase',
        week: 'flex w-full mt-1',
        day: 'h-8 w-8 text-center text-xs p-0 relative focus-within:relative focus-within:z-20 font-normal text-neutral-700 hover:bg-neutral-100 rounded-lg flex items-center justify-center transition-colors',
        selected: 'bg-brand-600 text-white font-medium hover:bg-brand-700 hover:text-white rounded-lg',
        today: 'bg-neutral-100 font-bold text-brand-700 border border-brand-200',
        outside: 'text-neutral-300 opacity-50 pointer-events-none',
        disabled: 'text-neutral-300 opacity-50',
        range_start: 'bg-brand-600 text-white rounded-l-lg rounded-r-none',
        range_end: 'bg-brand-600 text-white rounded-r-lg rounded-l-none',
        range_middle: 'bg-brand-50 text-brand-900 rounded-none font-medium',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4 text-neutral-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-neutral-600" />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
