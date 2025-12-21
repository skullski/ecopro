import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BillingCancelled = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionToken = searchParams.get('session');

  useEffect(() => {
    // Redirect after 8 seconds if user doesn't click button
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 8000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full text-center">
        {/* Cancel Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-200 dark:bg-red-900/30 rounded-full blur-xl animate-pulse"></div>
            <XCircle className="w-20 h-20 text-red-600 dark:text-red-400 relative" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Payment Cancelled
        </h1>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your subscription payment has been cancelled. No charges were made to your account.
        </p>

        {/* Info Box */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-8 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
            Your store will continue to function normally if you're still within your free trial period. After the trial ends, you'll need to renew your subscription to keep your store active.
          </p>
          <div className="bg-white dark:bg-gray-800 rounded p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">Session ID (for reference)</p>
            <p className="text-xs font-mono text-gray-500 dark:text-gray-500 break-all">
              {sessionToken || 'N/A'}
            </p>
          </div>
        </div>

        {/* Reasons Section */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-8 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Common reasons for cancellation:
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 text-left">
            <li className="flex gap-2">
              <span className="text-gray-400">•</span>
              <span>Closed the payment page by mistake</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400">•</span>
              <span>Wanted to review billing details again</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400">•</span>
              <span>Need to update payment method</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/billing')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>

          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="w-full border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-semibold py-3 gap-2"
          >
            Return to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Contact Support */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Having trouble with payment?
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
            contact support@ecopro.com
          </p>
        </div>

        {/* Redirect Notice */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
          Redirecting to dashboard in a few seconds...
        </p>
      </div>
    </div>
  );
};

export default BillingCancelled;
