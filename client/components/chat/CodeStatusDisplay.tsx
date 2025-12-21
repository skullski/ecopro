/**
 * Code Status Display Component
 * Shows the status of subscription codes in the chat
 */

import React from 'react';
import { Clock, AlertCircle, CheckCircle, Lock, AlertTriangle } from 'lucide-react';

interface CodeStatusDisplayProps {
  codeRequest: any;
  userRole: 'client' | 'seller';
  onRedeemClick?: () => void;
}

function getCodeStatus(codeRequest: any) {
  const isExpired = new Date(codeRequest.expiry_date) < new Date();
  const hoursLeft = (new Date(codeRequest.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60);

  if (codeRequest.status === 'used') {
    return {
      status: 'used' as const,
      label: `Redeemed ${new Date(codeRequest.redeemed_at).toLocaleDateString()}`,
      color: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400'
    };
  }

  if (codeRequest.status === 'pending') {
    return {
      status: 'pending' as const,
      label: 'Awaiting payment confirmation',
      color: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400'
    };
  }

  if (isExpired) {
    return {
      status: 'expired' as const,
      label: 'Code expired',
      color: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400'
    };
  }

  if (hoursLeft < 0.25) {
    return {
      status: 'expiring-soon' as const,
      label: `Expires in ${Math.round(hoursLeft * 60)} minutes`,
      color: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
      icon: 'text-orange-600 dark:text-orange-400'
    };
  }

  return {
    status: 'issued' as const,
    label: `${Math.floor(hoursLeft)} hour${Math.floor(hoursLeft) !== 1 ? 's' : ''} remaining`,
    color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400'
  };
}

export function CodeStatusDisplay({ codeRequest, userRole, onRedeemClick }: CodeStatusDisplayProps) {
  const status = getCodeStatus(codeRequest);
  const expiryDate = new Date(codeRequest.expiry_date);
  const issuedDate = codeRequest.issued_at ? new Date(codeRequest.issued_at) : null;
  const redeemedDate = codeRequest.redeemed_at ? new Date(codeRequest.redeemed_at) : null;

  return (
    <div className={`w-full rounded-lg p-4 border-2 ${
      status.status === 'used' ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' :
      status.status === 'expired' ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' :
      status.status === 'expiring-soon' ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800' :
      status.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800' :
      'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
    }`}>
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          {status.status === 'used' && <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />}
          {status.status === 'expired' && <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />}
          {status.status === 'expiring-soon' && <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />}
          {status.status === 'pending' && <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />}
          {status.status === 'issued' && <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <div>
            <h4 className={`font-semibold ${
              status.status === 'used' ? 'text-green-900 dark:text-green-100' :
              status.status === 'expired' ? 'text-red-900 dark:text-red-100' :
              status.status === 'expiring-soon' ? 'text-orange-900 dark:text-orange-100' :
              status.status === 'pending' ? 'text-yellow-900 dark:text-yellow-100' :
              'text-blue-900 dark:text-blue-100'
            }`}>
              {status.label}
            </h4>
          </div>

          {/* Code Display */}
          {codeRequest.generated_code && (
            <div className="bg-white dark:bg-gray-900 rounded p-2 font-mono font-bold text-lg text-center text-gray-900 dark:text-white">
              {codeRequest.generated_code}
            </div>
          )}

          {/* Details */}
          <div className={`text-xs space-y-1 ${
            status.status === 'used' ? 'text-green-800 dark:text-green-300' :
            status.status === 'expired' ? 'text-red-800 dark:text-red-300' :
            status.status === 'expiring-soon' ? 'text-orange-800 dark:text-orange-300' :
            status.status === 'pending' ? 'text-yellow-800 dark:text-yellow-300' :
            'text-blue-800 dark:text-blue-300'
          }`}>
            {issuedDate && (
              <p>Issued: {issuedDate.toLocaleString()}</p>
            )}
            {expiryDate && status.status !== 'used' && (
              <p>Expires: {expiryDate.toLocaleString()}</p>
            )}
            {redeemedDate && (
              <p>Redeemed: {redeemedDate.toLocaleString()}</p>
            )}
            {codeRequest.payment_method && (
              <p>Payment: {codeRequest.payment_method}</p>
            )}
          </div>

          {/* Seller Notes */}
          {codeRequest.seller_notes && (
            <div className="bg-white dark:bg-gray-900 rounded p-2 text-xs italic text-gray-700 dark:text-gray-300">
              Notes: {codeRequest.seller_notes}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {userRole === 'client' && status.status === 'issued' && (
              <button
                onClick={onRedeemClick}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
              >
                Redeem Code
              </button>
            )}
            {status.status === 'expired' && userRole === 'seller' && (
              <button
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
              >
                Issue New Code
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
