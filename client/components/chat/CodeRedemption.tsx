/**
 * Subscription Code Redemption Component
 * Allows clients to redeem subscription codes
 * Includes rate limiting feedback and code status display
 */

import React, { useState } from 'react';
import { Lock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface CodeRedemptionProps {
  onSuccess?: (subscription: any) => void;
  onError?: (error: string) => void;
  showInline?: boolean;
}

export function CodeRedemption({ onSuccess, onError, showInline = false }: CodeRedemptionProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [rateLimitReset, setRateLimitReset] = useState(0);

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!code.trim()) {
        throw new Error('Please enter a code');
      }

      const response = await apiFetch<any>('/api/codes/redeem', {
        method: 'POST',
        body: JSON.stringify({ code: code.trim().toUpperCase() })
      });

      if (response.error) {
        setError(response.error);
        setAttemptsRemaining(response.attemptsRemaining || 5);
        if (response.resetIn) {
          setRateLimitReset(response.resetIn);
        }
        onError?.(response.error);
      } else {
        setSuccess(true);
        setCode('');
        setAttemptsRemaining(5);
        setRateLimitReset(0);
        onSuccess?.(response.subscription);

        // Show success for 5 seconds then fade
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to redeem code';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFormatCode = (value: string) => {
    // Auto-format code as user types: XXXX-XXXX-XXXX-XXXX
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    let formatted = '';

    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0 && cleaned[i] !== '-') {
        formatted += '-';
      }
      formatted += cleaned[i];
    }

    setCode(formatted.slice(0, 19)); // Max length with hyphens
  };

  if (showInline) {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Redeem Subscription Code
        </h3>

        <form onSubmit={handleRedeemCode} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => handleFormatCode(e.target.value)}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Code format: XXXX-XXXX-XXXX-XXXX (valid for 1 hour)
            </p>
          </div>

          {error && (
            <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{error}</p>
                {attemptsRemaining < 5 && (
                  <p className="text-xs mt-1">
                    Attempts remaining: {attemptsRemaining}/5
                  </p>
                )}
              </div>
            </div>
          )}

          {success && (
            <div className="flex gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded text-sm text-green-700 dark:text-green-300">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>Code redeemed successfully! Your subscription is now active.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !code || success}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Validating...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Redeemed
              </>
            ) : (
              'Redeem Code'
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <dialog className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" open>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Redeem Code
        </h2>

        <form onSubmit={handleRedeemCode} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subscription Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => handleFormatCode(e.target.value)}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              disabled={loading}
              autoFocus
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You'll receive this code from your seller via chat
            </p>
          </div>

          {error && (
            <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <div className="text-red-700 dark:text-red-300">
                <p className="font-medium">{error}</p>
                {attemptsRemaining > 0 && attemptsRemaining < 5 && (
                  <p className="text-xs mt-1">
                    {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
                  </p>
                )}
              </div>
            </div>
          )}

          {success && (
            <div className="flex gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded text-sm text-green-700 dark:text-green-300">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Success! Subscription activated.</p>
                <p className="text-xs mt-1">Your account now has full access.</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !code || success}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Redeem Code'
              )}
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
