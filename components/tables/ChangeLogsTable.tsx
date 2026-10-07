'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FileEdit, Calendar, User, Eye, ArrowRight, Trash2, Bus, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface AuditLog {
  _id: string;
  recordId: string;
  recordType: string;
  changedBy: { _id: string; name: string; role: string };
  changedAt: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}

function safeFormatDate(dateVal: unknown, fmt: string): string {
  if (!dateVal) return 'N/A';
  try {
    const d = new Date(dateVal as string | number);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return format(d, fmt);
  } catch {
    return 'Invalid Date';
  }
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined || val === '') return 'Empty';
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) return val.length === 0 ? 'Empty Array' : val.map((v) => formatValue(v)).join(', ');
  if (typeof val === 'object') {
    return Object.entries(val)
      .filter(([k]) => !['_id'].includes(k))
      .map(([k, v]) => `${k}: ${formatValue(v)}`)
      .join(' | ');
  }
  return String(val);
}

function getDifferences(before: Record<string, unknown>, after: Record<string, unknown>) {
  const diffs: { key: string; oldValue: unknown; newValue: unknown }[] = [];
  const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);

  allKeys.forEach((key) => {
    if (['_id', '__v', 'updatedAt', 'createdAt'].includes(key)) return;

    const oldVal = before?.[key];
    const newVal = after?.[key];

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      // Historical fix: Ignore ID to Object transitions for referenced fields
      if (typeof oldVal === 'string' && typeof newVal === 'object' && newVal !== null) {
        const newId = (newVal as Record<string, unknown>)._id || (newVal as Record<string, unknown>).id;
        if (String(newId) === String(oldVal) || ['busId', 'driverId', 'attendantId'].includes(key)) {
          return;
        }
      }
      diffs.push({ key, oldValue: oldVal, newValue: newVal });
    }
  });
  return diffs;
}

export function ChangeLogsTable() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/audit-logs');
        const json = await res.json();
        if (json.success) {
          setLogs(json.data);
        } else {
          setError(json.error || 'Failed to fetch logs');
        }
      } catch (err) {
        console.error(err);
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-xs flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-sm text-neutral-500 font-medium">Loading change logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center shadow-xs">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center shadow-xs flex flex-col items-center">
        <FileEdit className="w-12 h-12 text-neutral-300 mb-3" />
        <h3 className="text-lg font-bold text-neutral-900">No changes recorded</h3>
        <p className="text-sm text-neutral-500 mt-1">Audit logs will appear here when records are modified or deleted.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-neutral-50/80 text-neutral-500 border-b border-neutral-200">
            <tr>
              <th className="px-5 py-3 font-semibold tracking-wide">Date & Time</th>
              <th className="px-5 py-3 font-semibold tracking-wide">Action By</th>
              <th className="px-5 py-3 font-semibold tracking-wide">Record Type</th>
              <th className="px-5 py-3 font-semibold tracking-wide">Action</th>
              <th className="px-5 py-3 font-semibold tracking-wide text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {logs.map((log) => {
              const isDelete = log.after?.status === 'edited' && log.after?.notes === '[DELETED]';
              
              return (
                <tr key={log._id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-5 py-3 text-neutral-900">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      {format(new Date(log.changedAt), 'dd MMM yyyy, hh:mm a')}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                        <User className="w-3 h-3 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-neutral-900 font-medium">{log.changedBy?.name || 'Unknown'}</p>
                        <p className="text-[10px] text-neutral-500 uppercase font-semibold">{log.changedBy?.role || 'user'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-neutral-600 font-medium">
                    {log.recordType}
                    <div className="text-xs text-neutral-400 font-mono mt-0.5" title={log.recordId}>
                      ID: {log.recordId.slice(-6)}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {isDelete ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-danger-50 text-danger-700 border border-danger-700/20">
                        <Trash2 className="w-3.5 h-3.5" />
                        Deleted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                        <FileEdit className="w-3.5 h-3.5" />
                        Modified
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-lg text-xs font-semibold transition-all shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Diff
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileEdit className="w-5 h-5 text-brand-600" />
              Change Log Details
            </DialogTitle>
            <DialogDescription asChild>
              <div className="flex flex-col gap-1.5 mt-2">
                {selectedLog?.after?.date && (
                  <div className="font-medium text-neutral-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    Trip Date: {safeFormatDate(selectedLog.after.date, 'dd MMM yyyy')}
                  </div>
                )}
                {selectedLog?.after?.createdAt && (
                  <div className="font-medium text-neutral-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    Created On: {safeFormatDate(selectedLog.after.createdAt, 'dd MMM yyyy, hh:mm a')}
                  </div>
                )}
                {selectedLog?.after?.busId && (typeof selectedLog.after.busId === 'object') && (
                  <div className="font-medium text-neutral-800 flex items-center gap-2">
                    <Bus className="w-4 h-4 text-neutral-400" />
                    Bus: {((selectedLog.after.busId as Record<string, unknown>).name as string) || 'Unknown'} {((selectedLog.after.busId as Record<string, unknown>).plateNumber as string) ? `(${((selectedLog.after.busId as Record<string, unknown>).plateNumber as string)})` : ''}
                  </div>
                )}
                <div className="text-xs text-neutral-400 mt-1 font-mono">
                  Record ID: {selectedLog?.recordId}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-sm">
                <div>
                  <p className="text-neutral-500 font-medium text-xs uppercase mb-1">Changed By</p>
                  <p className="text-neutral-900 font-bold">{selectedLog.changedBy?.name} <span className="text-neutral-400 font-normal">({selectedLog.changedBy?.role})</span></p>
                </div>
                <div className="text-right">
                  <p className="text-neutral-500 font-medium text-xs uppercase mb-1">Date & Time</p>
                  <p className="text-neutral-900 font-bold">{format(new Date(selectedLog.changedAt), 'dd MMM yyyy, hh:mm a')}</p>
                </div>
              </div>

              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 bg-neutral-100/50 border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  <div className="col-span-3 p-3">Field</div>
                  <div className="col-span-4 p-3 text-red-600">Old Value</div>
                  <div className="col-span-1 flex items-center justify-center border-x border-neutral-200/50"></div>
                  <div className="col-span-4 p-3 text-green-600">New Value</div>
                </div>
                
                <div className="divide-y divide-neutral-100 bg-white">
                  {getDifferences(selectedLog.before, selectedLog.after).map((diff, idx) => (
                    <div key={idx} className="grid grid-cols-12 text-sm">
                      <div className="col-span-3 p-3 font-mono text-xs text-neutral-600 font-medium border-r border-neutral-100 bg-neutral-50/50 flex items-center">
                        {diff.key}
                      </div>
                      <div className="col-span-4 p-3 bg-danger-50 text-danger-700">
                        <pre className="whitespace-pre-wrap font-mono text-xs break-words">
                          {formatValue(diff.oldValue)}
                        </pre>
                      </div>
                      <div className="col-span-1 flex items-center justify-center bg-neutral-50">
                        <ArrowRight className="w-4 h-4 text-neutral-300" />
                      </div>
                      <div className="col-span-4 p-3 bg-success-50 text-success-700">
                        <pre className="whitespace-pre-wrap font-mono text-xs break-words">
                          {formatValue(diff.newValue)}
                        </pre>
                      </div>
                    </div>
                  ))}
                  
                  {getDifferences(selectedLog.before, selectedLog.after).length === 0 && (
                    <div className="p-6 text-center text-neutral-500 text-sm">
                      No significant field differences detected.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
