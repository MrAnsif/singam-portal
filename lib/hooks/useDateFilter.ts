import { useState, useCallback, useEffect } from 'react';
import type { Period } from '@/components/ui/PeriodSelector';
import { periodToDateRange, DateRangeStrings } from '@/lib/date-utils';

export function useDateFilter(initialPeriod: Period = 'month') {
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Sync state with URL search parameters on mount if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlFrom = params.get('from');
      const urlTo = params.get('to');
      const urlPeriod = params.get('period') as Period | null;

      if (urlFrom && urlTo) {
        setPeriod('custom');
        setCustomFrom(urlFrom);
        setCustomTo(urlTo);
      } else if (urlPeriod && ['today', 'week', 'month', '6months', 'year', 'custom'].includes(urlPeriod)) {
        setPeriod(urlPeriod);
      }
    }
  }, []);

  const dateRange: DateRangeStrings | null = periodToDateRange(period, customFrom, customTo);

  const handleCustomDateChange = useCallback((from: string, to: string) => {
    setCustomFrom(from);
    setCustomTo(to);
  }, []);

  let queryParams: string | null = null;
  const range = periodToDateRange(period, customFrom, customTo);
  if (period !== 'custom' || range) {
    queryParams = `period=${period}`;
    if (range) {
      queryParams += `&from=${range.from}&to=${range.to}`;
    }
  }

  return {
    period,
    setPeriod,
    customFrom,
    customTo,
    dateRange,
    handleCustomDateChange,
    queryParams,
    isCustomReady: period !== 'custom' || (!!customFrom && !!customTo),
  };
}
