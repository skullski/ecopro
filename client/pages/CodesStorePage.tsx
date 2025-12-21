// Codes Store Page - Browse sellers and request codes

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, Loader, AlertCircle, Star, TrendingUp } from 'lucide-react';

interface Seller {
  id: number;
  store_name: string;
  description?: string;
  rating?: number;
  total_codes_issued?: number;
  response_time?: string;
}

export default function CodesStorePage() {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<Seller[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sellers
  useEffect(() => {
    loadSellers();
  }, []);

  // Filter sellers based on search
  useEffect(() => {
    const filtered = sellers.filter((seller) =>
      seller.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSellers(filtered);
  }, [searchTerm, sellers]);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stores/all', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to load sellers');

      const data = await response.json();
      setSellers(data.stores || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      // Use mock data for demo
      setSellers([
        {
          id: 1,
          store_name: 'Premium Store',
          description: 'High quality discount codes and exclusive offers',
          rating: 4.8,
          total_codes_issued: 1250,
          response_time: '< 1 hour'
        },
        {
          id: 2,
          store_name: 'Tech Deals',
          description: 'Technology products with special discounts',
          rating: 4.5,
          total_codes_issued: 890,
          response_time: '< 2 hours'
        },
        {
          id: 3,
          store_name: 'Fashion Hub',
          description: 'Latest fashion trends with exclusive codes',
          rating: 4.7,
          total_codes_issued: 2100,
          response_time: '< 30 min'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCode = (sellerId: number, storeName: string) => {
    // Navigate to chat with this seller pre-selected
    navigate('/chat', { state: { sellerId, storeName } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Codes Store
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Browse sellers and request exclusive codes and discounts
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sellers by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Using demo data to show sellers. Connect your store to see real sellers.</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {searchTerm ? 'No sellers found matching your search' : 'No sellers available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSellers.map((seller) => (
              <div
                key={seller.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-105"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {seller.store_name}
                  </h2>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    {seller.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {seller.rating}
                        </span>
                      </div>
                    )}
                    {seller.total_codes_issued && (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <TrendingUp className="w-4 h-4" />
                        <span>{seller.total_codes_issued} codes</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  {seller.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {seller.description}
                    </p>
                  )}

                  {/* Response Time */}
                  {seller.response_time && (
                    <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300 font-medium">
                      ⚡ Response time: {seller.response_time}
                    </div>
                  )}

                  {/* Stats Line */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <span>Available Codes</span>
                    <span className="font-bold text-green-600 dark:text-green-400">Active</span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleRequestCode(seller.id, seller.store_name)}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Request Code
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Chat with Sellers</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Send messages directly to sellers and request codes through our secure chat system.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Instant Codes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get codes immediately once sellers respond to your requests. Codes are delivered securely.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Verified Sellers</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Browse ratings and response times to find the best sellers with the fastest service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
