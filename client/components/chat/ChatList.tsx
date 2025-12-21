// Chat List Component - Side Panel

import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Search, ArrowLeft } from 'lucide-react';

interface ChatPreview {
  id: number;
  client_id?: number;
  client_name?: string;
  client_email?: string;
  unread_count?: number;
  last_message_at?: string;
  status: string;
}

interface ChatListProps {
  userRole: 'client' | 'seller';
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

  useEffect(() => {
    loadChats();
    // Refresh chats every 30 seconds
    const interval = setInterval(loadChats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Filter chats based on search term
    const filtered = chats.filter((chat) => {
      const searchText = searchTerm.toLowerCase();
      if (userRole === 'seller') {
        return chat.client_name?.toLowerCase().includes(searchText) ||
               chat.client_email?.toLowerCase().includes(searchText);
      }
      return true;
    });
    setFilteredChats(filtered);
  }, [chats, searchTerm, userRole]);

  const loadChats = async () => {
    try {
      const response = await fetch('/api/chat/list', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) {
        throw new Error('Failed to load chats');
      }

      const data = await response.json();
      setChats(data.chats || []);
      setError(null);
    } catch (err: any) {
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
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {userRole === 'seller' ? 'Customer Chats' : 'Support Chat'}
          </h2>
          {userRole === 'client' && onCreateChat && (
            <button
              onClick={onCreateChat}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Start new chat"
            >
              <Plus className="w-5 h-5 text-blue-600" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={userRole === 'seller' ? 'Search customers...' : ''}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading chats...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-red-600 text-sm">{error}</div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <MessageCircle className="w-12 h-12 mb-4 opacity-50" />
            <p>No chats yet</p>
            {userRole === 'client' && (
              <p className="text-xs mt-2">Start a chat to request codes</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                  selectedChatId === chat.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {userRole === 'seller' ? (
                      <>
                        <div className="font-medium text-gray-900 truncate">
                          {chat.client_name || 'Unknown Customer'}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {chat.client_email}
                        </div>
                      </>
                    ) : (
                      <div className="font-medium text-gray-900">Support</div>
                    )}
                  </div>

                  {(chat.unread_count || 0) > 0 && (
                    <span className="ml-2 flex-shrink-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.unread_count}
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-400 mt-1">
                  {formatTime(chat.last_message_at)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 text-xs text-gray-500">
        {filteredChats.length} {filteredChats.length === 1 ? 'chat' : 'chats'}
      </div>
    </div>
  );
}
