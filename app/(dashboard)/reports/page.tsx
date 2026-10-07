'use client';
// app/(dashboard)/reports/page.tsx
// Comprehensive operational & financial reports page with print and export capabilities
import { useState, useEffect, useCallback } from 'react';
import { PeriodSelector } from '@/components/ui/PeriodSelector';
import { useDateFilter } from '@/lib/hooks/useDateFilter';
import { Printer, Download } from 'lucide-react';

export default function ReportsPage() {
  const {
    period,
    setPeriod,
    dateRange,
    handleCustomDateChange,
    queryParams,
  } = useDateFilter('month');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadReport = async () => {
      if (queryParams === null) return;

      setLoading(true);
      try {
        const url = `/api/reports${queryParams ? `?${queryParams}` : ''}`;
        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json();
        
        if (!isMounted) return;
        
        if (json.success) {
          setData(json.data.summary);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadReport();
    
    return () => {
      isMounted = false;
    };
  }, [queryParams]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!data) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Total Logged Entries,${data.totalRecords}\n` +
      `Distance Travelled (KM),${data.totalKm}\n` +
      `Diesel Consumed (L),${data.totalDieselL}\n` +
      `Total Expenses (INR),${data.totalExpense}\n` +
      `Trip Booking Revenue (INR),${data.totalRevenue}\n` +
      `Fuel Efficiency (KM/L),${data.kmPerL}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `singam_report_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 print:p-0">
      {/* Non-printable action header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Operational Reports</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Generate and export period performance reports for management review.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <PeriodSelector
            selectedPeriod={period}
            dateRange={dateRange ?? undefined}
            onPeriodChange={setPeriod}
            onCustomDateChange={handleCustomDateChange}
          />
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-neutral-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
          <div>
            <h2 className="text-2xl font-black text-brand-950 uppercase tracking-wide">
              SINGAM TRAVELS
            </h2>
            <p className="text-xs text-neutral-500">Internal Operations & Financial Performance Summary</p>
          </div>
          <div className="text-right text-xs text-neutral-500">
            <p>
              Report Period:{' '}
              <strong className="capitalize text-neutral-900">
                {period} {dateRange ? `(${dateRange.from} to ${dateRange.to})` : ''}
              </strong>
            </p>
            <p>Generated: {new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        {/* Executive Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <span className="text-neutral-500 font-medium">Total Operating Expense</span>
            <p className="text-2xl font-bold text-neutral-900 mt-1">
              {loading ? '...' : `₹${(data?.totalExpense || 0).toLocaleString('en-IN')}`}
            </p>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <span className="text-neutral-500 font-medium">Trip Bookings Revenue</span>
            <p className="text-2xl font-bold text-success-700 mt-1">
              {loading ? '...' : `₹${(data?.totalRevenue || 0).toLocaleString('en-IN')}`}
            </p>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <span className="text-neutral-500 font-medium">Fleet Distance Logged</span>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {loading ? '...' : `${(data?.totalKm || 0).toLocaleString('en-IN')} KM`}
            </p>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <span className="text-neutral-500 font-medium">Fuel Efficiency Avg</span>
            <p className="text-2xl font-bold text-indigo-900 mt-1">
              {loading ? '...' : `${data?.kmPerL || 0} KM/L`}
            </p>
          </div>
        </div>

        {/* Breakdown Section */}
        <div className="space-y-3 pt-4 border-t border-neutral-200">
          <h3 className="font-bold text-sm text-neutral-900">Key Efficiency Indicators</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Fleet Active Buses:</span>
                <span className="font-bold">{loading ? '...' : (data?.activeBuses || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Submitted Daily Logs:</span>
                <span className="font-bold">{loading ? '...' : (data?.totalRecords || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Diesel Litres Consumed:</span>
                <span className="font-bold">{loading ? '...' : `${(data?.totalDieselL || 0).toLocaleString('en-IN')} L`}</span>
              </div>
            </div>

            <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Cost Per KM:</span>
                <span className="font-bold">{loading ? '...' : `₹${data?.costPerKm || 0} / KM`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Net Operational Contribution:</span>
                <span className={`font-bold ${(data?.netContribution || 0) >= 0 ? 'text-success-700' : 'text-danger-700'}`}>
                  {loading ? '...' : `₹${(data?.netContribution || 0).toLocaleString('en-IN')}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-6 border-t border-neutral-100 text-[11px] text-neutral-400 text-center">
          Singam Travels Confidential Internal Business Management Report
        </div>
      </div>
    </div>
  );
}
