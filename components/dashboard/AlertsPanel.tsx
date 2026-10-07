// components/dashboard/AlertsPanel.tsx
// Displays anomaly detection warnings and operational items needing attention (PRD §24)
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import type { AlertItem } from '@/lib/alerts';

interface AlertsPanelProps {
  alerts: AlertItem[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex items-center space-x-2 mb-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-neutral-900">Needs Attention</h3>
        </div>
        <p className="text-xs text-neutral-500">
          All operational metrics look healthy. No anomalies or invalid readings detected.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-neutral-900">Needs Attention</h3>
        </div>
        <span className="bg-neutral-50 text-neutral-900 text-xs px-2 py-0.5 rounded-full font-medium">
          {alerts.length} alert{alerts.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
        {alerts.map((alert) => {
          const isDanger = alert.type === 'danger';
          const isWarning = alert.type === 'warning';

          return (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border text-xs flex items-start space-x-2.5 ${isDanger
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : isWarning
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}
            >
              {isDanger ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : isWarning ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-0.5">
                <p className="font-semibold">{alert.title}</p>
                <p className="opacity-90">{alert.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
