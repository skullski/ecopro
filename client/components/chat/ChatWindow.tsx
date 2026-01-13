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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const isUserScrollingRef = useRef<boolean>(false);
  const shouldScrollRef = useRef<boolean>(true);
  const scrollRafRef = useRef<number | null>(null);

  const scrollToBottom = (options?: { force?: boolean; behavior?: ScrollBehavior }) => {
    const force = options?.force ?? false;
    const behavior = options?.behavior ?? 'smooth';
    if (force || shouldScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }
  };

  const scheduleScrollToBottom = (options?: { force?: boolean; behavior?: ScrollBehavior }) => {
    if (scrollRafRef.current) {
      cancelAnimationFrame(scrollRafRef.current);
    }
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      scrollToBottom(options);
    });
  };

  // Check if user is near bottom of chat
  const isNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const threshold = 100; // pixels from bottom
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  };

  // Handle scroll to detect if user is scrolling up
  const handleScroll = () => {
    if (isNearBottom()) {
      isUserScrollingRef.current = false;
      shouldScrollRef.current = true;
    } else {
      isUserScrollingRef.current = true;
      shouldScrollRef.current = false;
    }
  };

  // Handle input focus - scroll to bottom when user clicks on input
  const handleInputFocus = () => {
    isUserScrollingRef.current = false;
    shouldScrollRef.current = true;
    scheduleScrollToBottom({ force: true, behavior: 'smooth' });
  };

  useEffect(() => {
    loadChat();
    loadMessages();
    shouldScrollRef.current = true; // Scroll on initial load
    // Poll for new messages every 3 seconds for real-time feel
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    // Only auto-scroll if:
    // 1. It's the initial load (prevMessagesLength was 0)
    // 2. User just sent a message (new message from current user)
    // 3. User is near the bottom of the chat
    const isInitialLoad = prevMessagesLengthRef.current === 0 && messages.length > 0;
    const hasNewMessages = messages.length > prevMessagesLengthRef.current;
    
    if (isInitialLoad) {
      scrollToBottom({ force: true });
    } else if (hasNewMessages && !isUserScrollingRef.current) {
      scrollToBottom();
    }
    
    prevMessagesLengthRef.current = messages.length;
    
    // Mark messages as read when viewing
    if (messages.length > 0) {
      markMessagesAsRead();
    }
  }, [messages]);

  const loadChat = async () => {
    try {
      const response = await fetch(`/api/chat/list`);
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
      const response = await fetch(`/api/chat/${chatId}/messages?limit=50&offset=0`);

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
      const payload = {
        chat_id: Number(chatId),
        message_content: messageContent,
        message_type: 'text'
      };

      const response = await fetch(`/api/chat/${chatId}/message`, {
        method: 'POST',
        headers: {
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

    // If the user is typing, keep the chat pinned to the newest messages.
    // (This avoids the situation where the user scrolls up, focuses input, then types while still not at bottom.)
    if (document.activeElement === inputRef.current) {
      isUserScrollingRef.current = false;
      shouldScrollRef.current = true;
      scheduleScrollToBottom({ force: true, behavior: 'auto' });
    }
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
      {/* Header - Scales with viewport height */}
      <div 
        className="border-b border-gray-700 bg-gradient-to-r from-blue-700 to-blue-800 shadow-lg"
        style={{ padding: 'clamp(0.25rem, 1.5vh, 1.25rem) clamp(0.4rem, 2vh, 2rem)' }}
      >
        <div className="flex items-center justify-between" style={{ gap: 'clamp(0.2rem, 1vh, 1rem)' }}>
          <div className="flex items-center min-w-0 flex-1" style={{ gap: 'clamp(0.25rem, 1vh, 1rem)' }}>
            <div 
              className="rounded-full bg-white/20 flex items-center justify-center flex-shrink-0"
              style={{ width: 'clamp(1.25rem, 4vh, 3rem)', height: 'clamp(1.25rem, 4vh, 3rem)' }}
            >
              <span style={{ fontSize: 'clamp(0.6rem, 2vh, 1.5rem)' }}>💬</span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-white truncate" style={{ fontSize: 'clamp(0.7rem, 1.8vh, 1.25rem)' }}>
                {userRole === 'admin' ? 'Support Chat' : userRole === 'seller' ? 'Customer Chat' : 'Support Agent'}
              </h2>
              <p 
                className={`font-medium truncate ${chat.status === 'active' ? 'text-green-100' : 'text-yellow-100'}`}
                style={{ fontSize: 'clamp(0.5rem, 1.2vh, 0.875rem)' }}
              >
                {chat.status === 'active' ? '🟢 open' : '🟡 ' + chat.status}
              </p>
            </div>
          </div>
          <div className="flex items-center flex-shrink-0" style={{ gap: 'clamp(0.1rem, 0.8vh, 1rem)' }}>
            <button 
              className="hover:bg-white/10 rounded-lg transition text-white" 
              title="Voice call"
              style={{ padding: 'clamp(0.15rem, 0.8vh, 0.625rem)' }}
            >
              <Phone style={{ width: 'clamp(0.75rem, 2vh, 1.5rem)', height: 'clamp(0.75rem, 2vh, 1.5rem)' }} />
            </button>
            {onClose && (
              <button 
                onClick={onClose} 
                className="hover:bg-white/10 rounded-lg transition text-white"
                style={{ padding: 'clamp(0.15rem, 0.8vh, 0.625rem)', fontSize: 'clamp(0.7rem, 1.8vh, 1.25rem)' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2 md:p-4 bg-gradient-to-b from-gray-900 to-gray-950 dark:from-slate-800 dark:to-slate-900 space-y-2 md:space-y-3">
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

      {/* Input Area - Scales with viewport height */}
      <div 
        className="border-t border-gray-700 bg-gray-900 shadow-2xl"
        style={{ padding: 'clamp(0.25rem, 1.2vh, 1.25rem)' }}
      >
        <form onSubmit={handleSendMessage} className="flex flex-col" style={{ gap: 'clamp(0.2rem, 0.8vh, 0.625rem)' }}>
          <div className="flex" style={{ gap: 'clamp(0.2rem, 0.8vh, 0.625rem)' }}>
            {(userRole === 'client' || userRole === 'admin') && (
              <button
                type="button"
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="hover:bg-blue-100 rounded-lg transition flex-shrink-0 border border-blue-500 text-blue-600 font-medium hover:border-blue-600"
                title="Upload file"
                style={{ padding: 'clamp(0.2rem, 1vh, 0.875rem)' }}
              >
                <Upload style={{ width: 'clamp(0.75rem, 2vh, 1.5rem)', height: 'clamp(0.75rem, 2vh, 1.5rem)' }} />
              </button>
            )}

            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={messageInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                placeholder="Type message..."
                disabled={sending}
                rows={1}
                className="w-full border border-gray-700 bg-gray-800 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-gray-600 disabled:bg-gray-700 resize-none overflow-hidden"
                style={{ 
                  padding: 'clamp(0.2rem, 1vh, 0.875rem) clamp(0.3rem, 1.2vh, 1.25rem)',
                  paddingRight: 'clamp(1.5rem, 4.5vh, 3.5rem)',
                  fontSize: 'clamp(0.7rem, 1.5vh, 1.125rem)'
                }}
              />
              
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute hover:bg-gray-700 rounded-lg transition text-gray-400"
                title="Emoji"
                style={{ 
                  right: 'clamp(0.2rem, 1vh, 1rem)', 
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: 'clamp(0.1rem, 0.5vh, 0.5rem)'
                }}
              >
                <Smile style={{ width: 'clamp(0.7rem, 1.8vh, 1.375rem)', height: 'clamp(0.7rem, 1.8vh, 1.375rem)' }} />
              </button>
            </div>

            <button
              type="submit"
              disabled={sending || !messageInput.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 transition flex-shrink-0 shadow-md hover:shadow-lg"
              style={{ padding: 'clamp(0.2rem, 1vh, 0.875rem)' }}
            >
              {sending ? (
                <Loader style={{ width: 'clamp(0.75rem, 2vh, 1.5rem)', height: 'clamp(0.75rem, 2vh, 1.5rem)' }} className="animate-spin" />
              ) : (
                <Send style={{ width: 'clamp(0.75rem, 2vh, 1.5rem)', height: 'clamp(0.75rem, 2vh, 1.5rem)' }} />
              )}
            </button>
          </div>

          {/* Emoji Picker - Scales with viewport height */}
          {showEmojiPicker && (
            <div 
              className="grid grid-cols-8 bg-gray-800 rounded-lg border border-gray-700 overflow-y-auto"
              style={{ gap: 'clamp(0.1rem, 0.5vh, 0.5rem)', padding: 'clamp(0.2rem, 0.8vh, 0.875rem)', maxHeight: 'clamp(2.5rem, 10vh, 7rem)' }}
            >
              {['😀', '😂', '😍', '🤔', '😢', '😡', '👍', '👎', '❤️', '🔥', '✨', '🎉', '🎈', '🎁', '💡', '🚀'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => addEmoji(emoji)}
                  className="hover:bg-gray-700 rounded transition"
                  style={{ fontSize: 'clamp(0.7rem, 2.5vh, 1.75rem)', padding: 'clamp(0.05rem, 0.5vh, 0.5rem)' }}
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
