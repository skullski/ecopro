// Message List Component - Display Messages with Rich UI

import React from 'react';
import { CheckCheck, Check, AlertCircle, Download, File } from 'lucide-react';

interface ChatMessage {
  id: number;
  sender_id: number;
  sender_type: 'client' | 'seller' | 'admin';
  message_content: string;
  message_type: 'text' | 'code_request' | 'code_response' | 'system' | 'file_attachment';
  metadata?: any;
  is_read: boolean;
  created_at: string;
}

interface MessageListProps {
  messages: ChatMessage[];
  userRole: 'client' | 'seller' | 'admin';
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
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  const getSenderLabel = (senderType: string) => {
    if (senderType === 'admin') return '👨‍💼 Admin';
    if (senderType === 'seller') return '🏪 Seller';
    return '👤 You';
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedMessages).map(([date, dayMessages]) => (
        <div key={date}>
          {/* Date Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
            <span className="text-xs font-semibold text-gray-500 px-3 py-1 bg-gray-800 rounded-full">{date}</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          </div>

          {/* Messages */}
          <div className="space-y-3">
            {dayMessages.map((message, index) => {
              const isOwnMessage = 
                (userRole === 'client' && message.sender_type === 'client') ||
                (userRole === 'seller' && message.sender_type === 'seller') ||
                (userRole === 'admin' && message.sender_type === 'admin');

              const showSenderLabel = !isOwnMessage && (
                index === 0 || 
                dayMessages[index - 1]?.sender_type !== message.sender_type
              );

              return (
                <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}>
                  <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                    {/* Sender Label */}
                    {showSenderLabel && !isOwnMessage && (
                      <p className="text-xs font-bold text-gray-400 mb-1 ml-1">{getSenderLabel(message.sender_type)}</p>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`px-4 py-3 rounded-2xl transition-all shadow-sm hover:shadow-md ${
                        isOwnMessage
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none'
                          : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-none'
                      }`}
                    >
                      {/* System Message */}
                      {message.message_type === 'system' && (
                        <p className={`text-sm italic text-center ${
                          isOwnMessage ? 'text-blue-100' : 'text-gray-300'
                        }`}>
                          {message.message_content}
                        </p>
                      )}

                      {/* Regular Text Message */}
                      {message.message_type === 'text' && (
                        <p className="text-sm break-words leading-relaxed whitespace-pre-wrap">
                          {message.message_content}
                        </p>
                      )}

                      {/* Code Request Message */}
                      {message.message_type === 'code_request' && (
                        <div className={`text-sm space-y-2 ${isOwnMessage ? 'text-blue-100' : 'text-gray-300'}`}>
                          <div className="flex items-center gap-2 font-bold">
                            <span className="text-lg">📋</span>
                            <span>Code Request</span>
                          </div>
                          <div className={`space-y-1 text-xs ${isOwnMessage ? 'text-blue-50' : 'text-gray-400'}`}>
                            <p><strong>Type:</strong> {message.metadata?.code_type || 'General'}</p>
                            {message.metadata?.description && (
                              <p className="italic">{message.metadata.description}</p>
                            )}
                            <p className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-current"></span>
                              Status: Pending Review
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Code Response Message */}
                      {message.message_type === 'code_response' && (
                        <div className={`text-sm space-y-3 ${isOwnMessage ? 'text-blue-100' : 'text-gray-300'}`}>
                          <div className="flex items-center gap-2 font-bold text-green-400">
                            <span className="text-lg">✅</span>
                            <span>Code Issued!</span>
                          </div>
                          {message.metadata?.code && (
                            <div className={`mt-2 p-3 rounded-lg font-mono text-center text-sm font-bold tracking-wider ${
                              isOwnMessage 
                                ? 'bg-blue-400/30 text-blue-50' 
                                : 'bg-gray-700 text-gray-100'
                            }`}>
                              {message.metadata.code}
                            </div>
                          )}
                          {message.metadata?.expiry_at && (
                            <p className="text-xs opacity-75">
                              Expires: {new Date(message.metadata.expiry_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}

                      {/* File Attachment Message */}
                      {message.message_type === 'file_attachment' && (
                        <div className={`text-sm space-y-2 ${isOwnMessage ? 'text-blue-100' : 'text-gray-300'}`}>
                          {console.log('[MessageList] File attachment metadata:', message.metadata)}
                          {message.metadata?.isImage ? (
                            // Image Preview
                            <div className="space-y-2">
                              <img
                                src={message.metadata.fileUrl}
                                alt={message.metadata.fileName || 'Shared image'}
                                className="max-w-xs rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition"
                                onClick={() => window.open(message.metadata.fileUrl, '_blank')}
                              />
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <span className="truncate">{message.metadata.fileName}</span>
                                <a
                                  href={message.metadata.fileUrl}
                                  download
                                  className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition"
                                  title="Download file"
                                >
                                  <Download className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          ) : (
                            // File Attachment (non-image)
                            <div className="flex items-center gap-2 font-bold mb-2">
                              <File className="w-5 h-5" />
                              <span>File Shared</span>
                            </div>
                          )}
                          {!message.metadata?.isImage && (
                            <div className={`p-3 rounded-lg flex items-center gap-3 ${
                              isOwnMessage 
                                ? 'bg-blue-400/30' 
                                : 'bg-gray-700'
                            }`}>
                              <File className="w-8 h-8 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{message.metadata?.fileName || message.message_content}</p>
                                <p className="text-xs opacity-75">
                                  {message.metadata?.size ? `${(message.metadata.size / 1024 / 1024).toFixed(2)} MB` : 'File'}
                                </p>
                              </div>
                              <a
                                href={message.metadata?.fileUrl}
                                download
                                className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg transition"
                                title="Download file"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Time and Read Status */}
                    <div className={`flex items-center justify-end gap-1 mt-1 text-xs font-medium ${
                      isOwnMessage ? 'text-blue-400' : 'text-gray-500'
                    }`}>
                      <span>{formatTime(message.created_at)}</span>
                      {isOwnMessage && (
                        message.is_read ? (
                          <CheckCheck className="w-3 h-3 text-green-500" />
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
