// Chat Window Component - Main Chat Area with Rich UI

import React, { useState, useEffect, useRef } from 'react';
import { Send, Upload, AlertCircle, Loader, Smile, Paperclip, Phone, Plus } from 'lucide-react';
import { MessageList } from './MessageList';
import { FileUploadUI } from './FileUploadUI';

interface ChatMessage {
  id: number;
  chat_id: number;
  sender_id: number;
  sender_type: 'client' | 'seller' | 'admin';
  message_content: string;
  message_type: 'text' | 'code_request' | 'code_response' | 'system' | 'file_attachment';
  metadata?: any;
  is_read: boolean;
  created_at: string;
}

interface Chat {
  id: number;
  client_id: number;
  seller_id?: number;
  store_id?: number;
  status: 'active' | 'archived' | 'closed';
  created_at: string;
}

interface ChatWindowProps {
  chatId: number;
  userRole: 'client' | 'seller' | 'admin';
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
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadChat();
    loadMessages();
    // Poll for new messages every 3 seconds for real-time feel
    const interval = setInterval(loadMessages, 3000);
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
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
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
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });

      if (!response.ok) throw new Error('Failed to load messages');

      const data = await response.json();
      setMessages(data.items || data.messages || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
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
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          chat_id: chatId,
          message_ids: unreadIds 
        })
      });
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || sending || !chat) return;

    const messageContent = messageInput.trim();
    setSending(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        chat_id: Number(chatId),
        message_content: messageContent,
        message_type: 'text'
      };

      const response = await fetch(`/api/chat/${chatId}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details?.[0]?.message || `Failed: ${response.status}`);
      }

      setMessageInput('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
      await loadMessages();
    } catch (err: any) {
      console.error('Send message error:', err.message);
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    // Auto-grow textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const addEmoji = (emoji: string) => {
    setMessageInput(messageInput + emoji);
    setShowEmojiPicker(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Chat not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-950 dark:bg-slate-900">
      {/* Header */}
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-700 bg-gradient-to-r from-blue-700 to-blue-800 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-base md:text-lg">💬</span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-white text-sm md:text-lg truncate">
                {userRole === 'admin' ? 'Support Chat' : userRole === 'seller' ? 'Customer Chat' : 'Support Agent'}
              </h2>
              <p className={`text-xs font-medium truncate ${
                chat.status === 'active' ? 'text-green-100' : 'text-yellow-100'
              }`}>
                {chat.status === 'active' ? '🟢 Active' : '🟡 ' + chat.status}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
            <button className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition text-white" title="Voice call">
              <Phone className="w-4 md:w-5 h-4 md:h-5" />
            </button>
            {onClose && (
              <button onClick={onClose} className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition text-white text-lg">
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-gradient-to-b from-gray-900 to-gray-950 dark:from-slate-800 dark:to-slate-900 space-y-3 md:space-y-4">
        {error && (
          <div className="mb-4 p-3 md:p-4 bg-red-900/30 border border-red-700 rounded-xl text-red-200 text-xs md:text-sm flex items-center gap-3">
            <AlertCircle className="w-4 md:w-5 h-4 md:h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-4">
              <div className="w-12 md:w-16 h-12 md:h-16 rounded-full bg-blue-900/50 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-2xl md:text-3xl">👋</span>
              </div>
              <p className="text-gray-300 font-medium text-sm md:text-base">No messages yet</p>
              <p className="text-gray-500 text-xs md:text-sm mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            <MessageList messages={messages} userRole={userRole} userId={userId} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* File Upload UI */}
      {showFileUpload && (userRole === 'client' || userRole === 'admin') && (
        <div className="border-t border-gray-700 bg-blue-950/50 p-4">
          <FileUploadUI
            chatId={chatId}
            onClose={() => setShowFileUpload(false)}
            onSuccess={() => {
              setShowFileUpload(false);
              loadMessages();
            }}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-700 bg-gray-900 p-3 md:p-4 shadow-2xl">
        <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
          <div className="flex gap-2">
            {(userRole === 'client' || userRole === 'admin') && (
              <button
                type="button"
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="p-2 md:p-3 hover:bg-blue-100 rounded-xl transition flex-shrink-0 border border-blue-500 text-blue-600 font-medium hover:border-blue-600"
                title="Upload file"
              >
                <Upload className="w-4 md:w-5 h-4 md:h-5" />
              </button>
            )}

            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={messageInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type message..."
                disabled={sending}
                rows={1}
                className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-700 bg-gray-800 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-gray-600 disabled:bg-gray-700 resize-none overflow-hidden"
              />
              
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-2 md:right-3 top-2 md:top-3 p-1 md:p-2 hover:bg-gray-700 rounded-lg transition text-gray-400"
                title="Emoji"
              >
                <Smile className="w-4 md:w-5 h-4 md:h-5" />
              </button>
            </div>

            <button
              type="submit"
              disabled={sending || !messageInput.trim()}
              className="p-2 md:p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 transition flex-shrink-0 shadow-md hover:shadow-lg"
            >
              {sending ? (
                <Loader className="w-4 md:w-5 h-4 md:h-5 animate-spin" />
              ) : (
                <Send className="w-4 md:w-5 h-4 md:h-5" />
              )}
            </button>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="grid grid-cols-6 md:grid-cols-8 gap-2 p-2 md:p-3 bg-gray-800 rounded-xl border border-gray-700 max-h-24 overflow-y-auto">
              {['😀', '😂', '😍', '🤔', '😢', '😡', '👍', '👎', '❤️', '🔥', '✨', '🎉', '🎈', '🎁', '💡', '🚀'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => addEmoji(emoji)}
                  className="text-xl md:text-2xl hover:bg-gray-700 rounded-lg p-1 md:p-2 transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
