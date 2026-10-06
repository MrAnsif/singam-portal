import {
  format,
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  subMonths, startOfYear, endOfYear
} from 'date-fns';
import type { Period } from '@/components/ui/PeriodSelector';

export interface DateRangeStrings {
  from: string;
  to: string;
}

/**
 * Converts a Period preset or custom dates to YYYY-MM-DD string bounds in local timezone.
 */
export function periodToDateRange(
  period: Period,
  customFrom?: string,
  customTo?: string
): DateRangeStrings | null {
  const now = new Date();
  switch (period) {
    case 'today':
      return {
        from: format(startOfDay(now), 'yyyy-MM-dd'),
        to: format(endOfDay(now), 'yyyy-MM-dd'),
      };
    case 'week':
      return {
        from: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        to: format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      };
    case 'month':
      return {
        from: format(startOfMonth(now), 'yyyy-MM-dd'),
        to: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    case '6months':
      return {
        from: format(subMonths(now, 6), 'yyyy-MM-dd'),
        to: format(now, 'yyyy-MM-dd'),
      };
    case 'year':
      return {
        from: format(startOfYear(now), 'yyyy-MM-dd'),
        to: format(endOfYear(now), 'yyyy-MM-dd'),
      };
    case 'custom':
      if (customFrom && customTo) return { from: customFrom, to: customTo };
      return null;
    default:
      return null;
  }
}

/**
 * Constructs a MongoDB date range filter object ($gte and $lte) for backend API routes.
 * Supports explicit from/to strings or fallback period preset.
 */
export function buildMongoDateFilter(
  from?: string | null,
  to?: string | null,
  period?: Period | string | null
): Record<string, unknown> | null {
  let effectiveFrom = from;
  let effectiveTo = to;

  if (!effectiveFrom && !effectiveTo && period) {
    const range = periodToDateRange(period as Period);
    if (range) {
      effectiveFrom = range.from;
      effectiveTo = range.to;
    }
  }

  if (!effectiveFrom && !effectiveTo) return null;

  const dateFilter: Record<string, Date> = {};

  if (effectiveFrom) {
    const fromDate = new Date(`${effectiveFrom}T00:00:00.000Z`);
    dateFilter.$gte = isNaN(fromDate.getTime()) ? new Date(effectiveFrom) : fromDate;
  }

  if (effectiveTo) {
    const toDate = new Date(`${effectiveTo}T23:59:59.999Z`);
    dateFilter.$lte = isNaN(toDate.getTime()) ? new Date(effectiveTo) : toDate;
  }

  return dateFilter;
}
