// Import Results Component

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';

interface ImportResult {
  success: boolean;
  jobId: number;
  totalRows: number;
  successfulImports: number;
  failedRows: number;
  errors?: Record<string, string>;
}

interface ImportLog {
  row_number: number;
  status: 'success' | 'error';
  mapped_data: string;
  error_message?: string;
}

interface ImportResultsProps {
  jobId?: number;
  initialResult?: ImportResult;
  onClose?: () => void;
}

export function ImportResults({
  jobId,
  initialResult,
  onClose,
}: ImportResultsProps) {
  const [result, setResult] = useState<ImportResult | null>(initialResult || null);
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'summary' | 'errors'>('summary');

  useEffect(() => {
    if (jobId && !initialResult) {
      loadJobDetails();
    }
  }, [jobId, initialResult]);

  const loadJobDetails = async () => {
    if (!jobId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/google/imports/${jobId}`);

      if (!response.ok) {
        throw new Error('Failed to load import details');
      }

      const data = await response.json();
      setResult({
        success: data.successful_imports > 0,
        jobId: data.id,
        totalRows: data.total_rows,
        successfulImports: data.successful_imports,
        failedRows: data.failed_rows,
      });
      setLogs(data.logs || []);
    } catch (err: any) {
      console.error('Failed to load job details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !result) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
      </div>
    );
  }

  const successRate = result.totalRows > 0 ? Math.round((result.successfulImports / result.totalRows) * 100) : 0;
  const errorLogs = logs.filter(log => log.status === 'error');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Import Complete</h3>
          <p className="text-sm text-gray-600 mt-1">Job ID: {result.jobId}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Successful"
          value={result.successfulImports}
          color="green"
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5" />}
          label="Failed"
          value={result.failedRows}
          color="red"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Total"
          value={result.totalRows}
          color="blue"
        />
      </div>

      {/* Success Rate */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Success Rate</span>
          <span className="text-sm font-semibold text-gray-900">{successRate}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${result.successfulImports > 0 ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${successRate}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      {errorLogs.length > 0 && (
        <>
          <div className="border-b border-gray-200 mb-4 flex gap-4">
            <button
              onClick={() => setSelectedTab('summary')}
              className={`py-2 px-4 border-b-2 text-sm font-medium transition ${
                selectedTab === 'summary'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setSelectedTab('errors')}
              className={`py-2 px-4 border-b-2 text-sm font-medium transition ${
                selectedTab === 'errors'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Errors ({errorLogs.length})
            </button>
          </div>

          {selectedTab === 'errors' && (
            <div className="max-h-64 overflow-y-auto mb-6 space-y-2">
              {errorLogs.map((log) => (
                <div
                  key={log.row_number}
                  className="p-3 bg-red-50 border border-red-200 rounded text-sm"
                >
                  <div className="font-semibold text-red-900">Row {log.row_number}</div>
                  {log.error_message && (
                    <div className="text-red-700 mt-1">{log.error_message}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Message */}
      <div className={`p-4 rounded-lg mb-6 ${
        result.success
          ? 'bg-green-50 border border-green-200 text-green-800'
          : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
      }`}>
        {result.success
          ? `✓ Successfully imported ${result.successfulImports} row(s)`
          : `⚠ Import completed with ${result.failedRows} error(s)`}
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Close
          </button>
        )}
        <button
          onClick={() => {
            // Could implement re-download or export functionality
            alert('Export feature coming soon');
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Download Report
        </button>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'green' | 'red' | 'blue';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className={`rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
