// Code Request UI Component - Request and Display Codes

import React, { useState, useEffect } from 'react';
import { Copy, Check, Clock, Loader, X } from 'lucide-react';

interface CodeRequest {
  id: number;
  chat_id: number;
  client_id: number;
  code_type: string;
  status: 'pending' | 'issued' | 'used' | 'expired';
  code?: string;
  created_at: string;
  expiry_at?: string;
}

interface CodeRequestUIProps {
  chatId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CodeRequestUI({ chatId, onClose, onSuccess }: CodeRequestUIProps) {
  const [codeType, setCodeType] = useState('general');
  const [expiryHours, setExpiryHours] = useState(24);
  const [loading, setLoading] = useState(false);
  const [codeRequests, setCodeRequests] = useState<CodeRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [tab, setTab] = useState<'request' | 'history'>('request');

  useEffect(() => {
    loadCodeRequests();
  }, [chatId]);

  const loadCodeRequests = async () => {
    setLoadingRequests(true);
    try {
      const response = await fetch(`/api/chat/${chatId}/codes`);

      if (!response.ok) throw new Error('Failed to load code requests');

      const data = await response.json();
      setCodeRequests(data.requests || []);
    } catch (err: any) {
      console.error('Failed to load code requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/chat/${chatId}/request-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code_type: codeType,
          expiry_hours: expiryHours
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to request code');
      }

      setCodeType('general');
      setExpiryHours(24);
      await loadCodeRequests();
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { bg: string; text: string; icon?: React.ReactNode } } = {
      pending: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
      issued: { bg: 'bg-green-50', text: 'text-green-700', icon: '✅' },
      used: { bg: 'bg-blue-50', text: 'text-blue-700', icon: '✔️' },
      expired: { bg: 'bg-red-50', text: 'text-red-700', icon: '⏰' }
    };

    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-gray-50 border-t border-gray-200 rounded-t-lg">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setTab('request')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition ${
            tab === 'request'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Request Code
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition ${
            tab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          History
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        {tab === 'request' && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Code Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code Type
              </label>
              <select
                value={codeType}
                onChange={(e) => setCodeType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">General Code</option>
                <option value="discount">Discount Code</option>
                <option value="voucher">Voucher</option>
                <option value="license">License Key</option>
                <option value="activation">Activation Code</option>
              </select>
            </div>

            {/* Expiry Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Time (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="720"
                value={expiryHours}
                onChange={(e) => setExpiryHours(parseInt(e.target.value) || 24)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Code will expire in {expiryHours} hours
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Requesting...
                </>
              ) : (
                'Request Code'
              )}
            </button>
          </form>
        )}

        {tab === 'history' && (
          <div>
            {loadingRequests ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : codeRequests.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No code requests yet</p>
            ) : (
              <div className="space-y-3">
                {codeRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.code_type.charAt(0).toUpperCase() + request.code_type.slice(1)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleString()}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    {request.status === 'issued' && request.code && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                          <code className="flex-1 font-mono text-sm text-gray-900">
                            {request.code}
                          </code>
                          <button
                            onClick={() => copyToClipboard(request.code!, request.id)}
                            className="p-1 hover:bg-gray-200 rounded transition"
                            title="Copy code"
                          >
                            {copiedId === request.id ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>

                        {request.expiry_at && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expires: {new Date(request.expiry_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <p className="text-xs text-gray-600 mt-2">
                        Waiting for seller to issue a code...
                      </p>
                    )}

                    {request.status === 'expired' && (
                      <p className="text-xs text-red-600 mt-2">
                        This code request has expired.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
