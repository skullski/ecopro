/**
 * Admin Chat Page - Full Screen
 * Clean, dedicated chat interface for admin
 */

import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, Send, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Chat {
  id: number;
  client_id: number;
  client_name: string;
  client_email: string;
  unread_count: number;
  last_message_at: string;
  status: string;
}

interface Message {
  id: number;
  sender_id: number;
  sender_type: 'admin' | 'client';
  message_content: string;
  message_type: string;
  metadata?: any;
  created_at: string;
  is_read?: boolean;
}

const TIERS = [
  { id: 'bronze', name: 'Bronze', bgColor: 'bg-amber-500' },
  { id: 'silver', name: 'Silver', bgColor: 'bg-slate-400' },
  { id: 'gold', name: 'Gold', bgColor: 'bg-yellow-500' },
];

export default function AdminChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [issuingCode, setIssuingCode] = useState<string | null>(null);

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedChatId) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChatId]);

  const loadChats = async () => {
    try {
      const response = await apiFetch<any>('/api/chat/admin/all-chats');
      if (response.chats) {
        setChats(response.chats);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to load chats:', err);
      setError('Failed to load chats');
    }
  };

  const loadMessages = async () => {
    if (!selectedChatId) return;
    try {
      const response = await apiFetch<any>(`/api/chat/${selectedChatId}/messages`);
      if (response.items) {
        setMessages(response.items);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedChatId) return;

    const chatId = Number(selectedChatId);
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/chat/${chatId}/message`, {
        method: 'POST',
        body: JSON.stringify({
          chat_id: chatId,
          message_content: input,
          message_type: 'text',
        }),
      });
      console.log('Message sent:', response);
      setInput('');
      await loadMessages();
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCode = async (tier: string) => {
    if (!selectedChatId) return;

    const selectedChat = chats.find(c => Number(c.id) === selectedChatId);
    if (!selectedChat) return;

    setIssuingCode(tier);
    try {
      const response = await apiFetch<any>('/api/codes/admin/issue', {
        method: 'POST',
        body: JSON.stringify({
          chat_id: selectedChatId,
          client_id: selectedChat.client_id,
          tier,
          admin_id: (window as any).currentUser?.id,
        }),
      });

      if (response.success) {
        const message = `🎁 ${tier.toUpperCase()} Code Generated\n\n\`${response.code}\`\n\nValid for: 1 hour\n\nPlease send payment proof and I'll confirm.`;
        
        await apiFetch(`/api/chat/${selectedChatId}/message`, {
          method: 'POST',
          body: JSON.stringify({
            chat_id: selectedChatId,
            message_content: message,
            message_type: 'text',
          }),
        });

        await loadMessages();
        setShowCodePanel(false);
      }
    } catch (err) {
      console.error('Failed to issue code:', err);
    } finally {
      setIssuingCode(null);
    }
  };

  const selectedChat = chats.find(c => Number(c.id) === selectedChatId);
  const filteredChats = chats.filter(chat =>
    chat.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.client_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar - Chat List */}
      <div className="w-72 bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-3 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur flex-shrink-0">
          <h2 className="text-xl font-black text-white mb-3 flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            Messages
          </h2>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-700/40 backdrop-blur border border-slate-600/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white placeholder-slate-400 transition-all text-sm"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent min-h-0">
          {error && (
            <div className="m-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2 backdrop-blur">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {filteredChats.length === 0 ? (
            <div className="p-4 text-center text-slate-400">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredChats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChatId(Number(chat.id))}
                  className={`w-full px-2 py-2 rounded-lg text-left transition-all duration-200 group ${
                    selectedChatId === Number(chat.id) 
                      ? 'bg-gradient-to-r from-blue-600/40 to-blue-500/30 border border-blue-500/50' 
                      : 'bg-slate-700/20 border border-transparent hover:bg-slate-700/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                      {chat.client_name.charAt(0).toUpperCase()}
                    </div>
                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-semibold text-white truncate text-sm">{chat.client_name}</h3>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {formatTime(chat.last_message_at)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{chat.client_email}</p>
                    </div>
                    {/* Unread Badge */}
                    {chat.unread_count > 0 && (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {chat.unread_count}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-slate-900/50 flex flex-col overflow-hidden">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {selectedChat.client_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-sm text-white">{selectedChat.client_name}</h2>
                  <p className="text-xs text-slate-400">{selectedChat.client_email}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-900/30 scrollbar-thin scrollbar-thumb-slate-600/50 scrollbar-track-transparent min-h-0">
              {error && (
                <div className="mb-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-xs">
                  {error}
                </div>
              )}
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-xl backdrop-blur-sm transition-all ${
                      msg.sender_type === 'admin'
                        ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white'
                        : 'bg-slate-700/60 text-slate-100 border border-slate-600/50'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message_content}</p>
                    {msg.metadata?.isImage && msg.metadata?.fileUrl && (
                      <img 
                        src={msg.metadata.fileUrl} 
                        alt={msg.metadata.fileName || 'Shared image'} 
                        className="mt-2 max-w-[200px] rounded-lg border border-white/10 cursor-pointer hover:opacity-90"
                        onClick={() => window.open(msg.metadata.fileUrl, '_blank')}
                      />
                    )}
                    {msg.metadata?.fileUrl && !msg.metadata?.isImage && (
                      <a 
                        href={msg.metadata.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center gap-2 text-blue-300 hover:text-blue-200 text-xs"
                      >
                        📎 {msg.metadata.fileName || 'Download file'}
                      </a>
                    )}
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender_type === 'admin' ? 'text-blue-100/70' : 'text-slate-400'
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-slate-700/50 bg-gradient-to-t from-slate-800/90 to-slate-900/80 backdrop-blur flex-shrink-0 space-y-2">
              {/* Code Panel */}
              {showCodePanel && (
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600/20 to-blue-500/10 border border-blue-500/30 backdrop-blur">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-sm text-white">🎁 Issue Code</h4>
                    <button
                      onClick={() => setShowCodePanel(false)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {TIERS.map(tier => (
                      <button
                        key={tier.id}
                        onClick={() => handleIssueCode(tier.id)}
                        disabled={issuingCode === tier.id}
                        className={`px-3 py-2 rounded-lg font-bold text-sm text-white transition-all disabled:opacity-50 ${tier.bgColor} hover:brightness-110`}
                      >
                        {issuingCode === tier.id ? '⏳' : tier.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-700/40 backdrop-blur border border-slate-600/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white placeholder-slate-400 disabled:opacity-50 transition-all text-sm"
                />
                {input.trim() ? (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg disabled:from-slate-600 disabled:to-slate-500 font-bold transition-all flex items-center gap-2 text-sm"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                ) : null}
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-4 text-slate-400">
            <div className="p-4 bg-slate-800/40 backdrop-blur rounded-2xl border border-slate-700/50">
              <MessageCircle className="w-10 h-10 opacity-20 mx-auto" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-sm text-white mb-1">Select a chat</h3>
              <p className="text-xs text-slate-400">Choose a client to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
