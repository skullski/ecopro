// WebSocket Hook for Real-time Chat
// Handles WebSocket connection, reconnection, and message handling

import { useState, useEffect, useRef, useCallback } from 'react';

export type WSMessageType = 
  | 'chat:message'
  | 'chat:typing'
  | 'chat:stop_typing'
  | 'chat:read'
  | 'chat:reaction'
  | 'chat:edit'
  | 'chat:delete'
  | 'chat:join'
  | 'chat:leave'
  | 'presence:online'
  | 'presence:offline'
  | 'error'
  | 'ping'
  | 'pong';

export interface WSMessage {
  type: WSMessageType;
  chatId?: number;
  data?: any;
  timestamp?: string;
}

export interface ChatMessageWS {
  id: number;
  chat_id: number;
  sender_id: number;
  sender_type: 'client' | 'seller' | 'admin';
  message_content: string;
  message_type: string;
  metadata?: any;
  is_read: boolean;
  created_at: string;
}

interface UseWebSocketOptions {
  chatId?: number;
  autoConnect?: boolean;
  onMessage?: (message: ChatMessageWS) => void;
  onTyping?: (userId: number, userName?: string) => void;
  onStopTyping?: (userId: number) => void;
  onEdit?: (messageId: number, newContent: string) => void;
  onDelete?: (messageId: number) => void;
  onReaction?: (messageId: number, reaction: string, userId: number, action: 'add' | 'remove') => void;
  onRead?: (readerId: number, messageIds?: number[]) => void;
  onUserJoin?: (userId: number, userName?: string) => void;
  onUserLeave?: (userId: number) => void;
  onPresenceChange?: (userId: number, online: boolean) => void;
  onError?: (error: string) => void;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_BASE = 1000; // Start with 1 second
const RECONNECT_DELAY_MAX = 30000; // Max 30 seconds

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    chatId,
    autoConnect = true,
    onMessage,
    onTyping,
    onStopTyping,
    onEdit,
    onDelete,
    onReaction,
    onRead,
    onUserJoin,
    onUserLeave,
    onPresenceChange,
    onError,
  } = options;

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentChatIdRef = useRef<number | undefined>(chatId);

  // Update ref when chatId changes
  useEffect(() => {
    const prevChatId = currentChatIdRef.current;
    currentChatIdRef.current = chatId;
    
    // If connected and chatId changed, leave old room and join new
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      if (prevChatId && prevChatId !== chatId) {
        sendMessage({ type: 'chat:leave', chatId: prevChatId });
      }
      if (chatId) {
        sendMessage({ type: 'chat:join', chatId });
      }
    }
  }, [chatId]);

  // Get WebSocket URL
  const getWSUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    // Get token from cookie (same as REST API uses)
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token=') || row.startsWith('auth_token='))
      ?.split('=')[1];
    
    return `${protocol}//${host}/ws/chat${token ? `?token=${token}` : ''}`;
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || state.isConnecting) {
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const ws = new WebSocket(getWSUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0,
        }));

        // Join chat room if chatId is set
        if (currentChatIdRef.current) {
          sendMessage({ type: 'chat:join', chatId: currentChatIdRef.current });
        }

        // Start ping interval to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000); // Ping every 25 seconds
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('❌ WebSocket disconnected:', event.code, event.reason);
        cleanup();
        setState(prev => ({ ...prev, isConnected: false, isConnecting: false }));

        // Don't reconnect if closed intentionally or auth failed
        if (event.code === 4001 || event.code === 4002 || event.code === 4000) {
          return;
        }

        // Attempt reconnection
        scheduleReconnect();
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({ ...prev, error: 'Connection error' }));
        onError?.('Connection error');
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: 'Failed to connect',
      }));
    }
  }, [getWSUrl, onError, state.isConnecting]);

  // Handle incoming messages
  const handleMessage = useCallback((message: WSMessage) => {
    switch (message.type) {
      case 'pong':
        // Heartbeat response, connection is alive
        break;

      case 'chat:message':
        if (message.data) {
          onMessage?.(message.data);
        }
        break;

      case 'chat:typing':
        if (message.data) {
          onTyping?.(message.data.userId, message.data.userName);
        }
        break;

      case 'chat:stop_typing':
        if (message.data) {
          onStopTyping?.(message.data.userId);
        }
        break;

      case 'chat:edit':
        if (message.data) {
          onEdit?.(message.data.messageId, message.data.newContent);
        }
        break;

      case 'chat:delete':
        if (message.data) {
          onDelete?.(message.data.messageId);
        }
        break;

      case 'chat:reaction':
        if (message.data) {
          onReaction?.(
            message.data.messageId,
            message.data.reaction,
            message.data.userId,
            message.data.action
          );
        }
        break;

      case 'chat:read':
        if (message.data) {
          onRead?.(message.data.readerId, message.data.messageIds);
        }
        break;

      case 'chat:join':
        if (message.data) {
          onUserJoin?.(message.data.userId, message.data.userName);
        }
        break;

      case 'chat:leave':
        if (message.data) {
          onUserLeave?.(message.data.userId);
        }
        break;

      case 'presence:online':
        if (message.data) {
          onPresenceChange?.(message.data.userId, true);
        }
        break;

      case 'presence:offline':
        if (message.data) {
          onPresenceChange?.(message.data.userId, false);
        }
        break;

      case 'error':
        console.error('WebSocket error message:', message.data?.error);
        onError?.(message.data?.error || 'Unknown error');
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }, [onMessage, onTyping, onStopTyping, onEdit, onDelete, onReaction, onRead, onUserJoin, onUserLeave, onPresenceChange, onError]);

  // Schedule reconnection with exponential backoff
  const scheduleReconnect = useCallback(() => {
    setState(prev => {
      const newAttempts = prev.reconnectAttempts + 1;
      
      if (newAttempts > MAX_RECONNECT_ATTEMPTS) {
        return { ...prev, error: 'Max reconnection attempts reached', reconnectAttempts: newAttempts };
      }

      const delay = Math.min(
        RECONNECT_DELAY_BASE * Math.pow(2, newAttempts - 1),
        RECONNECT_DELAY_MAX
      );

      console.log(`🔄 Reconnecting in ${delay}ms (attempt ${newAttempts})`);

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);

      return { ...prev, reconnectAttempts: newAttempts };
    });
  }, [connect]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    cleanup();
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    setState({
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectAttempts: 0,
    });
  }, [cleanup]);

  // Send a message
  const sendMessage = useCallback((message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Join a chat room
  const joinRoom = useCallback((roomId: number) => {
    sendMessage({ type: 'chat:join', chatId: roomId });
  }, [sendMessage]);

  // Leave a chat room
  const leaveRoom = useCallback((roomId: number) => {
    sendMessage({ type: 'chat:leave', chatId: roomId });
  }, [sendMessage]);

  // Send typing indicator
  const sendTyping = useCallback(() => {
    if (!currentChatIdRef.current) return;
    
    sendMessage({ type: 'chat:typing', chatId: currentChatIdRef.current });

    // Auto-stop typing after 3 seconds of no activity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      sendStopTyping();
    }, 3000);
  }, [sendMessage]);

  // Send stop typing indicator
  const sendStopTyping = useCallback(() => {
    if (!currentChatIdRef.current) return;
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    sendMessage({ type: 'chat:stop_typing', chatId: currentChatIdRef.current });
  }, [sendMessage]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, []); // Only run on mount/unmount

  return {
    // State
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    error: state.error,
    reconnectAttempts: state.reconnectAttempts,

    // Actions
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendTyping,
    sendStopTyping,
    sendMessage,
  };
}

// Simple hook for just checking connection status
export function useWebSocketStatus() {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const checkConnection = () => {
      // Check if there's an active WebSocket
      setIsConnected(document.visibilityState === 'visible');
    };
    
    document.addEventListener('visibilitychange', checkConnection);
    return () => document.removeEventListener('visibilitychange', checkConnection);
  }, []);
  
  return isConnected;
}
