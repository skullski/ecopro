import { useTranslation } from "../lib/i18n";
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/lib/auth';
import { MessageCircle, ShoppingBag, Zap, ArrowRight, AlertCircle } from 'lucide-react';

export default function Billing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = getCurrentUser();

  // Redirect non-clients to login
  useEffect(() => {
    if (!user?.clientId) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user?.clientId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Subscription & Codes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Manage your subscription, access the codes store, and track your code requests
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Subscription Card */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Current Subscription</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View and manage your active subscription plan</p>
            </div>

            <div className="p-6">
              {/* Subscription Status */}
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-green-900 dark:text-green-300">✓ Active Plan</h3>
                    <p className="text-sm text-green-700 dark:text-green-400">Your subscription is active and in good standing</p>
                  </div>
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
              </div>

              {/* Plan Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Plan Type</p>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">Professional</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Renewal Date</p>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">Jan 21, 2026</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Cost</p>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">$29.99</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Chat Requests/Month</p>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">Unlimited</p>
                </div>
              </div>

              {/* Plan Features */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Included Features</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Access to Codes Store (all sellers)
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Unlimited chat requests with sellers
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Real-time message updates
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Code request history & tracking
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Seller ratings & reviews
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  View Invoice
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-700/50 shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/codes-store')}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Browse Codes Store
              </button>

              <button
                onClick={() => navigate('/chat')}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Open Chat
              </button>

              <div className="pt-3 border-t border-purple-200 dark:border-purple-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Your Chat Stats</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Active Chats</span>
                    <span className="font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-700 px-2 py-1 rounded">3</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Pending Codes</span>
                    <span className="font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-700 px-2 py-1 rounded">1</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Unread Messages</span>
                    <span className="font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-700 px-2 py-1 rounded text-red-600">2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* How It Works */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">How It Works</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Visit Codes Store</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Browse all available sellers</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Request Code</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Chat with seller and request a code</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Receive Code</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Seller issues code directly in chat</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">4</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Use Code</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Copy code and use your discount</p>
                </div>
              </div>
            </div>
          </div>

          {/* Need Help */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Need Help?</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  <span className="font-bold">💡 Tip:</span> Check seller ratings before requesting codes to find the fastest responders.
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-900 dark:text-green-300">
                  <span className="font-bold">✓ Secure:</span> All your messages are encrypted and stored securely.
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-900 dark:text-purple-300">
                  <span className="font-bold">⚡ Fast:</span> Most sellers respond within 1-2 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
