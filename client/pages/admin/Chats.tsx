/**
 * Admin Chat Management - Telegram Style
 * Platform admin manages all client code requests
 * Clients ask for tiers (Bronze/Silver/Gold)
 * Admin issues codes, clients send payment proof
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Phone, Info, Search, MoreVertical, Smile, X } from 'lucide-react';
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
  image_url?: string;
}

const TIERS = [
  { id: 'bronze', name: 'Bronze', bgColor: 'bg-amber-500', borderColor: 'border-amber-500' },
  { id: 'silver', name: 'Silver', bgColor: 'bg-slate-400', borderColor: 'border-slate-400' },
  { id: 'gold', name: 'Gold', bgColor: 'bg-yellow-500', borderColor: 'border-yellow-500' },
];

export default function AdminChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [issuingCode, setIssuingCode] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCodePanel, setShowCodePanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load all chats
  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load messages when chat selected
  useEffect(() => {
    if (selectedChat) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChats = async () => {
    try {
      const response = await apiFetch<any>('/api/chat/admin/all-chats');
      if (response.chats) {
        setChats(response.chats);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const loadMessages = async () => {
    if (!selectedChat) return;
    try {
      const response = await apiFetch<any>(`/api/chat/${selectedChat.id}/messages`);
      if (response.items) {
        setMessages(response.items);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedChat) return;

    setLoading(true);
    try {
      await apiFetch(`/api/chat/${selectedChat.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: input }),
      });
      setInput('');
      await loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCode = async (tier: string) => {
    if (!selectedChat) return;

    setIssuingCode(tier);
    try {
      const response = await apiFetch<any>('/api/codes/admin/issue', {
        method: 'POST',
        body: JSON.stringify({
          chat_id: selectedChat.id,
          client_id: selectedChat.client_id,
          tier,
          admin_id: (window as any).currentUser?.id,
        }),
      });

      if (response.success) {
        const message = `🎁 ${tier.toUpperCase()} Code Generated\n\n\`${response.code}\`\n\nValid for: 1 hour\n\nPlease send payment proof and I'll confirm.`;
        
        await apiFetch(`/api/chat/${selectedChat.id}/messages`, {
          method: 'POST',
          body: JSON.stringify({ body: message }),
        });

        await loadMessages();
        setShowCodePanel(false);
      }
    } catch (error) {
      console.error('Failed to issue code:', error);
    } finally {
      setIssuingCode(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiFetch<any>('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.url) {
        await apiFetch(`/api/chat/${selectedChat.id}/messages`, {
          method: 'POST',
          body: JSON.stringify({
            body: '📸 Payment Proof',
            image_url: response.url,
            message_type: 'image',
          }),
        });

        await loadMessages();
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.client_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    if (isToday) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const grouped: { [key: string]: Message[] } = {};
    
    msgs.forEach(msg => {
      const date = new Date(msg.created_at).toLocaleDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(msg);
    });
    
    return grouped;
  };

  return (
    <div className="h-screen flex bg-white dark:bg-slate-900">
      {/* Sidebar - Chat List */}
      <div className="w-96 flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Chats</h1>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              No chats found
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full px-4 py-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition text-left flex items-center gap-3 ${
                  selectedChat?.id === chat.id
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : ''
                }`}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {chat.client_name.charAt(0).toUpperCase()}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-medium text-slate-900 dark:text-white truncate">
                      {chat.client_name}
                    </h3>
                    {chat.last_message_at && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                        {formatTime(chat.last_message_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                    {chat.client_email}
                  </p>
                </div>

                {/* Unread Badge */}
                {chat.unread_count > 0 && (
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {chat.unread_count}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {selectedChat.client_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    {selectedChat.client_name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedChat.client_email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
                  <Phone className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
                  <Info className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
                  <MoreVertical className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-white dark:bg-slate-900">
              {Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
                <div key={date}>
                  {/* Date Divider */}
                  <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 px-2">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                  </div>

                  {/* Messages */}
                  {dateMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'} mb-2`}
                    >
                      <div
                        className={`max-w-lg ${
                          msg.sender_type === 'admin'
                            ? 'bg-blue-500 text-white rounded-3xl rounded-tr-none'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-3xl rounded-tl-none'
                        } px-4 py-2.5 shadow-sm`}
                      >
                        {msg.message_type === 'image' && msg.image_url ? (
                          <div className="space-y-2">
                            <img 
                              src={msg.image_url} 
                              alt="Payment proof" 
                              className="max-w-sm rounded-xl" 
                            />
                            <p className="text-sm">{msg.message_content}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {msg.message_content}
                            </p>
                            {msg.metadata?.code && (
                              <div className={`mt-2 p-3 rounded-lg font-mono text-xs ${
                                msg.sender_type === 'admin' 
                                  ? 'bg-blue-600' 
                                  : 'bg-slate-200 dark:bg-slate-700'
                              } break-all`}>
                                {msg.metadata.code}
                              </div>
                            )}
                          </div>
                        )}
                        <p className={`text-xs mt-1 ${
                          msg.sender_type === 'admin'
                            ? 'text-blue-100'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {new Date(msg.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Actions & Input */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3">
              {/* Code Panel */}
              {showCodePanel && (
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Issue Code</h4>
                    <button
                      onClick={() => setShowCodePanel(false)}
                      className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {TIERS.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => handleIssueCode(tier.id)}
                        disabled={issuingCode === tier.id}
                        className={`px-3 py-2 rounded-lg font-medium text-sm text-white ${tier.bgColor} hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-1`}
                      >
                        {issuingCode === tier.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          tier.name
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                {/* Attachment Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  <Paperclip className={`w-5 h-5 ${uploadingImage ? 'text-slate-300 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'}`} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Text Input */}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Aa"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />

                {/* Code/Send Buttons */}
                {input.trim() ? (
                  <button
                    type="submit"
                    disabled={loading}
                    className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 text-white rounded-full transition flex-shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCodePanel(!showCodePanel)}
                    className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-full transition flex-shrink-0"
                  >
                    🎁 Code
                  </button>
                )}
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-4 text-slate-500 dark:text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Smile className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold mb-1">Select a chat to start messaging</h3>
              <p className="text-sm">Choose a client conversation from the list</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
