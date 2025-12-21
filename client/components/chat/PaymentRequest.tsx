/**
 * Payment Request Component for Sellers
 * Allows sellers to request payment and issue subscription codes
 */

import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle, Loader, Copy } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface PaymentRequestProps {
  codeRequestId: number;
  chatId: number;
  clientEmail?: string;
  onCodeIssued?: (code: any) => void;
}

const PAYMENT_METHODS = [
  { id: 'binance', label: '💰 Binance Pay', color: 'bg-yellow-100 text-yellow-900' },
  { id: 'redotpay', label: '💳 RedotPay', color: 'bg-purple-100 text-purple-900' },
  { id: 'ccp', label: '🏦 CCP (Algeria)', color: 'bg-green-100 text-green-900' },
  { id: 'manual', label: '📱 Manual Transfer', color: 'bg-blue-100 text-blue-900' },
];

export function PaymentRequest({ codeRequestId, chatId, clientEmail, onCodeIssued }: PaymentRequestProps) {
  const [step, setStep] = useState<'select' | 'confirm' | 'issued'>('select');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issuedCode, setIssuedCode] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethod(methodId);
    setStep('confirm');
  };

  const handleIssueCode = async () => {
    if (!selectedMethod) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch<any>(`/api/codes/issue`, {
        method: 'POST',
        body: JSON.stringify({
          code_request_id: codeRequestId,
          payment_method: selectedMethod,
          notes: notes || null
        })
      });

      if (response.error) {
        setError(response.error);
      } else {
        setIssuedCode(response.code);
        setStep('issued');
        onCodeIssued?.(response.code);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to issue code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (issuedCode?.generated_code) {
      navigator.clipboard.writeText(issuedCode.generated_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (step === 'select') {
    return (
      <div className="w-full space-y-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Select Payment Method
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Client needs to pay for the subscription code. Choose how they should pay:
        </p>

        <div className="space-y-2">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => handleSelectMethod(method.id)}
              className={`w-full p-3 rounded-lg text-sm font-medium transition-all border-2 ${method.color} border-current hover:shadow-md`}
            >
              {method.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    const selectedMethodLabel = PAYMENT_METHODS.find(m => m.id === selectedMethod)?.label;

    return (
      <div className="w-full space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Issue Code via {selectedMethodLabel}
          </h3>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded text-sm text-blue-700 dark:text-blue-300 mb-4">
            <p>
              A unique subscription code will be generated and sent to the client via this chat.
            </p>
            <p className="text-xs mt-1 opacity-75">
              Code will be valid for 1 hour after being sent.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payment Details/Instructions (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Send payment to: wallet_address..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>

        {error && (
          <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/30 rounded text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setStep('select')}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handleIssueCode}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Issuing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Issue Code
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'issued' && issuedCode) {
    const expiryDate = new Date(issuedCode.expiry_date);
    const expiresIn = Math.round((expiryDate.getTime() - Date.now()) / (60 * 1000));

    return (
      <div className="w-full space-y-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex gap-2 text-green-700 dark:text-green-300">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Code Issued Successfully</h3>
            <p className="text-sm opacity-75">Code has been sent to the client via chat</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium text-gray-900 dark:text-white mb-1">Subscription Code</p>
            <div className="flex gap-2 items-center">
              <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-lg font-bold text-gray-900 dark:text-white">
                {issuedCode.generated_code}
              </code>
              <button
                onClick={handleCopyCode}
                className="px-3 py-2 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 rounded"
              >
                {copied ? 'Copied!' : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium text-gray-900 dark:text-white">Expires in:</p>
            <p className="text-red-600 dark:text-red-400 font-semibold">{expiresIn} minutes</p>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium text-gray-900 dark:text-white">Payment Method:</p>
            <p className="capitalize">{issuedCode.payment_method}</p>
          </div>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400">
          ⚠️ The client must redeem this code within 1 hour or it will expire.
        </p>

        <button
          onClick={() => {
            setStep('select');
            setSelectedMethod(null);
            setNotes('');
            setIssuedCode(null);
          }}
          className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg"
        >
          Issue Another Code
        </button>
      </div>
    );
  }

  return null;
}
