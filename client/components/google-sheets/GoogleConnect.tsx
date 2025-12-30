// Google Sheets OAuth Connection Component

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';

interface GoogleConnectProps {
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export function GoogleConnect({ onConnected, onDisconnected }: GoogleConnectProps) {
  const [status, setStatus] = useState<'disconnected' | 'connected'>('disconnected');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // Check OAuth callback after redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code) {
      handleOAuthCallback(code, state);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/google/status');
      const data = await response.json();

      if (data.connected) {
        setStatus('connected');
        if (data.expiresAt) {
          setExpiresAt(new Date(data.expiresAt).toLocaleDateString());
        }
      } else {
        setStatus('disconnected');
      }
    } catch (err: any) {
      console.error('Failed to check connection status:', err);
      setError(err.message);
    }
  };

  const handleOAuthCallback = async (code: string, state: string | null) => {
    try {
      const response = await fetch('/api/google/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state })
      });

      if (!response.ok) {
        throw new Error('Failed to connect Google account');
      }

      setStatus('connected');
      setError(null);
      onConnected?.();
      checkConnectionStatus();
    } catch (err: any) {
      setStatus('disconnected');
      setError(err.message);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/google/auth-url');
      const { url } = await response.json();
      window.location.href = url;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/google/disconnect', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      setStatus('disconnected');
      setExpiresAt(null);
      setError(null);
      onDisconnected?.();
    } catch (err: any) {
      setError(err.message);
      setStatus('connected');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Google Sheets Connection</h3>
          <p className="text-sm text-gray-600 mt-1">Connect your Google account to import data</p>
        </div>

        {status === 'connected' && (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        )}
        {status === 'disconnected' && (
          <AlertCircle className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {expiresAt && (
        <p className="text-sm text-gray-500 mt-2">
          Token expires: {expiresAt}
        </p>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {status === 'disconnected' ? (
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Connect Google Account
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}
