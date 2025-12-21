// Chat Page - Main Chat Interface

import React, { useState, useEffect } from 'react';
import { ChatList, ChatWindow } from '../components/chat';

interface User {
  id: number;
  email: string;
  role: 'client' | 'seller';
  clientId?: number;
  sellerId?: number;
}

export function ChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user info from token or auth context
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.clientId || payload.sellerId,
          email: payload.email,
          role: payload.clientId ? 'client' : 'seller',
          clientId: payload.clientId,
          sellerId: payload.sellerId
        });
      } catch (err) {
        console.error('Failed to parse user from token:', err);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to access chat</p>
          <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const userRole = user.clientId ? 'client' : 'seller';
  const userId = user.clientId || user.sellerId || 0;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile: Show either list or chat, not both */}
      <div className="hidden md:flex w-1/3 bg-white shadow-sm">
        <ChatList
          userRole={userRole}
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
        />
      </div>

      {/* Main Chat Area */}
      {selectedChatId ? (
        <div className="w-full md:w-2/3 bg-white">
          <ChatWindow
            chatId={selectedChatId}
            userRole={userRole}
            userId={userId}
            onClose={() => setSelectedChatId(null)}
          />
        </div>
      ) : (
        <div className="w-full md:w-2/3 hidden md:flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-gray-600 text-lg font-medium">
              {userRole === 'seller' ? 'Select a chat to start' : 'Welcome to Chat'}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {userRole === 'seller'
                ? 'Click on a customer to view and respond to messages'
                : 'Request codes from sellers'}
            </p>
          </div>
        </div>
      )}

      {/* Mobile: Show chat list modal-like when no chat selected */}
      {selectedChatId === null && (
        <div className="md:hidden fixed inset-0 z-50">
          <ChatList
            userRole={userRole}
            selectedChatId={selectedChatId}
            onSelectChat={setSelectedChatId}
          />
        </div>
      )}
    </div>
  );
}

export default ChatPage;
