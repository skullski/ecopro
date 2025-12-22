// Chat List Component - Side Panel with Rich UI

import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Search, ArrowLeft, Zap, AlertCircle } from 'lucide-react';

interface ChatPreview {
  id: number;
  client_id?: number;
  client_name?: string;
  client_email?: string;
  unread_count?: number;
  last_message_at?: string;
  status: string;
  tier?: string;
}

interface ChatListProps {
  userRole: 'client' | 'seller' | 'admin';
  selectedChatId?: number;
  onSelectChat: (chatId: number) => void;
  onCreateChat?: () => void;
}

export function ChatList({ userRole, selectedChatId, onSelectChat, onCreateChat }: ChatListProps) {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'unread'>('recent');

  useEffect(() => {
    loadChats();
    // Refresh chats every 30 seconds
    const interval = setInterval(loadChats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Filter and sort chats based on search and sort preference
    let filtered = chats.filter((chat) => {
      const searchText = searchTerm.toLowerCase();
      if (userRole === 'admin' || userRole === 'seller') {
        return (
          (chat.client_name?.toLowerCase().includes(searchText) ||
          chat.client_email?.toLowerCase().includes(searchText))
        );
      }
      return true;
    });

    // Sort chats
    if (sortBy === 'unread') {
      filtered = filtered.sort((a, b) => (b.unread_count || 0) - (a.unread_count || 0));
    }

    setFilteredChats(filtered);
  }, [chats, searchTerm, sortBy, userRole]);

  const loadChats = async () => {
    setLoading(true);
    try {
      const endpoint = userRole === 'admin' ? '/api/chat/admin/all-chats' : '/api/chat/list';
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });

      if (!response.ok) {
        throw new Error('Failed to load chats');
      }

      const data = await response.json();
      setChats(data.chats || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load chats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'No messages';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTierBadge = (tier?: string) => {
    const colors: Record<string, string> = {
      bronze: 'bg-amber-900/50 text-amber-300',
      silver: 'bg-slate-700 text-slate-200',
      gold: 'bg-yellow-900/50 text-yellow-300',
    };
    const icons: Record<string, string> = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
    };
    
    if (!tier) return null;
    return (
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${colors[tier] || 'bg-gray-700 text-gray-200'}`}>
        {icons[tier]} {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-gray-950 dark:from-slate-800 dark:to-slate-900 border-r border-gray-700">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 md:w-8 h-7 md:h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-4 md:w-5 h-4 md:h-5 text-white" />
            </div>
            <h2 className="text-base md:text-lg font-bold text-gray-100 truncate">
              {userRole === 'admin' ? 'Tickets' : 'Messages'}
            </h2>
          </div>
          {userRole === 'client' && onCreateChat && (
              <button
                onClick={onCreateChat}
                className="p-1.5 md:p-2 hover:bg-blue-900/30 rounded-lg transition text-blue-400 font-bold flex-shrink-0"
                title="Start new chat"
              >
                <Plus className="w-4 md:w-5 h-4 md:h-5" />
              </button>
            )}
        </div>

        {/* Search and Filter */}
        <div className="space-y-2 md:space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2 md:top-2.5 w-3 md:w-4 h-3 md:h-4 text-gray-500" />
            <input
              type="text"
              placeholder={userRole === 'admin' ? 'Search...' : 'Search'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-1.5 md:py-2 border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-gray-600 text-xs md:text-sm"
            />
          </div>

          {(userRole === 'admin' || userRole === 'seller') && (
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('recent')}
                className={`flex-1 text-xs font-medium py-1.5 md:py-2 px-2 md:px-3 rounded-lg transition ${
                  sortBy === 'recent'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setSortBy('unread')}
                className={`flex-1 text-xs font-medium py-1.5 md:py-2 px-2 md:px-3 rounded-lg transition ${
                  sortBy === 'unread'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Unread ({chats.reduce((sum, c) => sum + (c.unread_count || 0), 0)})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="p-3 md:p-4 m-2 md:m-3 bg-red-900/30 border border-red-700 rounded-lg text-red-200 text-xs md:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-300 border-t-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500 text-xs md:text-sm">Loading...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-sm">No chats yet</p>
            <p className="text-xs mt-1 opacity-75">
              {searchTerm ? 'Try a different search' : 'Start a new conversation'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full p-2.5 md:p-4 text-left hover:bg-gray-800 transition-colors ${
                  selectedChatId === chat.id ? 'bg-blue-900/40 border-l-4 border-blue-600' : 'hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 md:gap-3 mb-1.5 md:mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <p className="font-bold text-gray-100 truncate text-sm md:text-base">
                        {userRole === 'admin' || userRole === 'seller'
                          ? chat.client_name || 'Unknown'
                          : 'Support Team'}
                      </p>
                      {chat.unread_count! > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex-shrink-0">
                          {Math.min(chat.unread_count || 0, 9)}
                        </span>
                      )}
                    </div>
                      <p className="text-xs text-gray-500 truncate">{chat.client_email}</p>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0 font-medium">
                    {formatTime(chat.last_message_at)}
                  </span>
                </div>

                {/* Status and Tier */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                    {chat.status && chat.status !== 'active' && (
                      <span className="text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded bg-yellow-900/50 text-yellow-300 font-medium">
                        {chat.status}
                      </span>
                    )}
                    {chat.tier && getTierBadge(chat.tier)}
                  </div>
                  {chat.unread_count! > 0 && (
                    <Zap className="w-3.5 md:w-4 h-3.5 md:h-4 text-orange-500 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
