/**
 * Admin Chat Management Page
 * Platform admin manages all client code requests
 * Clients ask for tiers (Bronze/Silver/Gold)
 * Admin issues codes, clients send payment proof
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Copy, CheckCircle, AlertCircle, Loader, Download, Image as ImageIcon } from 'lucide-react';
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
  { id: 'bronze', name: 'Bronze', color: 'bg-amber-100 text-amber-900', price: 'Free' },
  { id: 'silver', name: 'Silver', color: 'bg-gray-100 text-gray-900', price: '$5/month' },
  { id: 'gold', name: 'Gold', color: 'bg-yellow-100 text-yellow-900', price: '$15/month' },
];

export default function AdminChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [issuingCode, setIssuingCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load all chats
  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Load messages when chat selected
  useEffect(() => {
    if (selectedChat) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  // Scroll to bottom when messages change
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

    setIssuingCode(true);
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
        // Send code to client in message
        const message = `✅ **${tier.toUpperCase()} Code Generated**\n\nCode: \`${response.code}\`\n\nValid for: 1 hour\nPlease send payment proof and I'll confirm.`;
        
        await apiFetch(`/api/chat/${selectedChat.id}/messages`, {
          method: 'POST',
          body: JSON.stringify({ body: message }),
        });

        await loadMessages();
      }
    } catch (error) {
      console.error('Failed to issue code:', error);
    } finally {
      setIssuingCode(false);
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
        // Send image as message
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

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="h-screen flex">
        {/* Chat List */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Client Requests</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{chats.length} active chats</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-4 border-b border-gray-100 dark:border-gray-700 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                  selectedChat?.id === chat.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-blue-500'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{chat.client_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{chat.client_email}</p>
                  </div>
                  {chat.unread_count > 0 && (
                    <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      {chat.unread_count}
                    </span>
                  )}
                </div>
                {chat.last_message_at && (
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(chat.last_message_at).toLocaleTimeString()}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          {selectedChat ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedChat.client_name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedChat.client_email}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender_type === 'admin'
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                      }`}
                    >
                      {msg.message_type === 'image' && msg.image_url ? (
                        <div className="space-y-2">
                          <img src={msg.image_url} alt="Payment proof" className="max-w-xs rounded" />
                          <p className="text-sm">{msg.message_content}</p>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm whitespace-pre-wrap">{msg.message_content}</p>
                          {msg.metadata?.code && (
                            <div className="mt-2 p-2 bg-black/20 rounded font-mono text-sm">
                              {msg.metadata.code}
                            </div>
                          )}
                        </>
                      )}
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender_type === 'admin' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex gap-2">
                  {TIERS.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => handleIssueCode(tier.id)}
                      disabled={issuingCode}
                      className={`flex-1 px-3 py-2 rounded text-sm font-medium ${tier.color} hover:opacity-80 disabled:opacity-50 transition`}
                    >
                      {issuingCode ? (
                        <Loader className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        `Issue ${tier.name}`
                      )}
                    </button>
                  ))}
                </div>

                {/* Image Upload */}
                <div className="flex items-center gap-2">
                  <label className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type message..."
                    disabled={loading}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center gap-2 transition"
                  >
                    {loading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 text-lg">Select a chat to begin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
