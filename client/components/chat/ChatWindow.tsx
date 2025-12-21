// Chat Window Component - Main Chat Area

import React, { useState, useEffect, useRef } from 'react';
import { Send, Package, AlertCircle, Loader } from 'lucide-react';
import { MessageList } from './MessageList';
import { CodeRequestUI } from './CodeRequestUI';

interface ChatMessage {
  id: number;
  chat_id: number;
  sender_id: number;
  sender_type: 'client' | 'seller';
  message_content: string;
  message_type: 'text' | 'code_request' | 'code_response' | 'system';
  metadata?: any;
  is_read: boolean;
  created_at: string;
}

interface Chat {
  id: number;
  client_id: number;
  seller_id: number;
  store_id?: number;
  status: 'active' | 'archived' | 'closed';
  created_at: string;
}

interface ChatWindowProps {
  chatId: number;
  userRole: 'client' | 'seller';
  userId: number;
  onClose?: () => void;
}

export function ChatWindow({ chatId, userRole, userId, onClose }: ChatWindowProps) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCodeRequest, setShowCodeRequest] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadChat();
    loadMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
    // Mark messages as read when viewing
    if (messages.length > 0) {
      markMessagesAsRead();
    }
  }, [messages]);

  const loadChat = async () => {
    try {
      const response = await fetch(`/api/chat/list`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      const currentChat = data.chats?.find((c: Chat) => c.id === chatId);
      if (currentChat) {
        setChat(currentChat);
      }
    } catch (err: any) {
      console.error('Failed to load chat:', err);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${chatId}/messages?limit=50&offset=0`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to load messages');

      const data = await response.json();
      setMessages(data.messages || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      const unreadIds = messages
        .filter(m => !m.is_read && m.sender_type !== userRole)
        .map(m => m.id);

      if (unreadIds.length === 0) return;

      await fetch(`/api/chat/${chatId}/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message_ids: unreadIds })
      });
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    setSending(true);
    try {
      const response = await fetch(`/api/chat/${chatId}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message_content: messageInput,
          message_type: 'text'
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      setMessageInput('');
      await loadMessages();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Chat not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              {userRole === 'seller' ? 'Customer Chat' : 'Support'}
            </h2>
            <p className="text-sm text-gray-500">
              {chat.status === 'active' ? 'Active' : 'Archived'}
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            <MessageList messages={messages} userRole={userRole} userId={userId} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Code Request UI */}
      {showCodeRequest && userRole === 'client' && (
        <CodeRequestUI
          chatId={chatId}
          onClose={() => setShowCodeRequest(false)}
          onSuccess={() => {
            setShowCodeRequest(false);
            loadMessages();
          }}
        />
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          {userRole === 'client' && (
            <button
              type="button"
              onClick={() => setShowCodeRequest(!showCodeRequest)}
              className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
              title="Request code"
            >
              <Package className="w-5 h-5 text-blue-600" />
            </button>
          )}

          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            disabled={sending || chat.status !== 'active'}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />

          <button
            type="submit"
            disabled={sending || !messageInput.trim() || chat.status !== 'active'}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition flex-shrink-0"
          >
            {sending ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>

        {chat.status !== 'active' && (
          <p className="text-xs text-gray-500 mt-2">
            This chat is {chat.status}. No new messages can be sent.
          </p>
        )}
      </div>
    </div>
  );
}
