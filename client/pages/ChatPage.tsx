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
    // Get user info from token
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Determine user type and ID based on token structure
        let userId = 0;
        let userType: 'client' | 'seller' | 'admin' = 'client';
        
        if (payload.user_type === 'admin' || payload.role === 'admin') {
          userType = 'admin';
          userId = parseInt(payload.id || 0);
        } else if (payload.user_type === 'client') {
          userType = 'client';
          userId = parseInt(payload.id || 0);
        } else if (payload.user_type === 'seller' || payload.sellerId) {
          userType = 'seller';
          userId = parseInt(payload.sellerId || payload.id || 0);
        } else if (payload.staffId) {
          userType = 'client';
          userId = parseInt(payload.clientId || 0);
        }
        
        setUser({
          id: userId,
          email: payload.email,
          role: userType === 'admin' ? 'seller' : 'client',
          clientId: userType === 'client' ? userId : parseInt(payload.clientId || 0),
          sellerId: userType === 'seller' ? userId : parseInt(payload.sellerId || 0)
        });
      } catch (err) {
        console.error('Failed to parse user from token:', err);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 overflow-hidden">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 overflow-hidden">
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
    <div className="flex flex-col md:flex-row w-full h-full bg-gray-50 overflow-hidden">
      {/* Chat List */}
      <div className="w-full md:w-1/3 bg-white shadow-sm flex flex-col min-h-0 order-2 md:order-1 overflow-hidden">
        <ChatList
          userRole={userRole}
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
        />
      </div>

      {/* Main Chat Area */}
      <div className="w-full md:w-2/3 bg-white flex flex-col min-h-0 order-1 md:order-2 overflow-hidden">
        {selectedChatId ? (
          <ChatWindow
            chatId={selectedChatId}
            userRole={userRole}
            userId={userId}
            onClose={() => setSelectedChatId(null)}
          />
        ) : (
          <div className="hidden md:flex items-center justify-center bg-gray-50 flex-1">
            <div className="text-center px-4">
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
      </div>
    </div>
  );
}

export default ChatPage;
