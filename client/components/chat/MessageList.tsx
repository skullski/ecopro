// Message List Component - Display Messages

import React from 'react';
import { CheckCheck, Check } from 'lucide-react';

interface ChatMessage {
  id: number;
  sender_id: number;
  sender_type: 'client' | 'seller';
  message_content: string;
  message_type: 'text' | 'code_request' | 'code_response' | 'system';
  metadata?: any;
  is_read: boolean;
  created_at: string;
}

interface MessageListProps {
  messages: ChatMessage[];
  userRole: 'client' | 'seller';
  userId: number;
}

export function MessageList({ messages, userRole, userId }: MessageListProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupedMessages: { [key: string]: ChatMessage[] } = {};
  messages.forEach((msg) => {
    const date = formatDate(msg.created_at);
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(msg);
  });

  return (
    <div className="space-y-4">
      {Object.entries(groupedMessages).map(([date, dayMessages]) => (
        <div key={date}>
          {/* Date Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-xs text-gray-500 px-2">{date}</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Messages */}
          <div className="space-y-2">
            {dayMessages.map((message) => {
              const isOwnMessage = 
                (userRole === 'client' && message.sender_type === 'client') ||
                (userRole === 'seller' && message.sender_type === 'seller');

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {/* System Message */}
                    {message.message_type === 'system' && (
                      <p className={`text-sm italic text-center ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-600'
                      }`}>
                        {message.message_content}
                      </p>
                    )}

                    {/* Regular Text Message */}
                    {message.message_type === 'text' && (
                      <p className="text-sm break-words">{message.message_content}</p>
                    )}

                    {/* Code Request Message */}
                    {message.message_type === 'code_request' && (
                      <div className={`text-sm ${isOwnMessage ? 'text-blue-100' : 'text-gray-700'}`}>
                        <p className="font-medium">📋 Code Request</p>
                        <p>Type: {message.metadata?.code_type || 'General'}</p>
                        {message.metadata?.description && (
                          <p className="text-xs mt-1">{message.metadata.description}</p>
                        )}
                        <p className="text-xs opacity-75 mt-1">Status: Pending</p>
                      </div>
                    )}

                    {/* Code Response Message */}
                    {message.message_type === 'code_response' && (
                      <div className={`text-sm ${isOwnMessage ? 'text-blue-100' : 'text-gray-700'}`}>
                        <p className="font-medium">✅ Code Issued</p>
                        <div className="mt-2 p-2 bg-opacity-20 bg-white rounded font-mono text-center">
                          {message.metadata?.code}
                        </div>
                        {message.metadata?.expiry_at && (
                          <p className="text-xs opacity-75 mt-1">
                            Expires: {new Date(message.metadata.expiry_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Time and Read Status */}
                    <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      <span>{formatTime(message.created_at)}</span>
                      {isOwnMessage && (
                        message.is_read ? (
                          <CheckCheck className="w-3 h-3" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
