// Chat Page - Main Chat Interface

import React, { useState, useEffect } from 'react';
import { ChatList, ChatWindow } from '../components/chat';
import { apiFetch } from '@/lib/api';
import { useTranslation } from '@/lib/i18n';

interface User {
  id: number;
  email: string;
  role: 'client' | 'seller';
  clientId?: number;
  sellerId?: number;
}

export function ChatPage() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingChat, setCreatingChat] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.id) {
            setUser({
              id: parsed.id,
              email: parsed.email,
              role: parsed.role === 'admin' ? 'seller' : 'client',
              clientId: parsed.role === 'admin' ? undefined : parsed.id,
              sellerId: undefined,
            });
            setLoading(false);
            return;
          }
        }

        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const me = await meRes.json();
          localStorage.setItem('user', JSON.stringify(me));
          setUser({
            id: me.id,
            email: me.email,
            role: me.role === 'admin' ? 'seller' : 'client',
            clientId: me.role === 'admin' ? undefined : me.id,
            sellerId: undefined,
          });
        }
      } catch (err) {
        console.error('Failed to bootstrap chat user:', err);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  // Auto-create admin chat for clients
  useEffect(() => {
    const autoCreateChat = async () => {
      if (!user || user.role !== 'client' || !user.clientId) return;
      
      setCreatingChat(true);
      try {
        // Try to create/get admin chat
        const response = await apiFetch<any>('/api/chat/create-admin-chat', {
          method: 'POST',
          body: JSON.stringify({ tier: 'bronze' })
        });
        
        if (response.chat?.id) {
          setSelectedChatId(response.chat.id);
        }
      } catch (err) {
        console.error('Failed to create admin chat:', err);
      } finally {
        setCreatingChat(false);
      }
    };

    if (user && user.role === 'client') {
      autoCreateChat();
    }
  }, [user]);

  if (loading || creatingChat) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 overflow-hidden">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{creatingChat ? (t("chat.connecting") || 'Connecting to support...') : (t("chat.loading") || 'Loading...')}</p>
        </div>
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
      {/* Chat List - hidden on mobile when a chat is selected */}
      <div className={`w-full md:w-1/3 bg-white shadow-sm flex flex-col min-h-0 order-2 md:order-1 overflow-hidden ${
        selectedChatId ? 'hidden md:flex' : 'flex'
      }`}>
        <ChatList
          userRole={userRole}
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
        />
      </div>

      {/* Main Chat Area - full width on mobile when chat selected */}
      <div className={`w-full md:w-2/3 bg-white flex flex-col min-h-0 order-1 md:order-2 overflow-hidden ${
        selectedChatId ? 'flex-1' : 'hidden md:flex'
      }`}>
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
