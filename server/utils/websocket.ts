// WebSocket Server for Real-time Chat
// Handles real-time messaging, typing indicators, and presence

import { WebSocketServer, WebSocket, RawData } from 'ws';
import { Server as HttpServer, IncomingMessage } from 'http';
import { verifyToken } from './auth';

// Message types for WebSocket communication
export type WSMessageType = 
  | 'chat:message'      // New chat message
  | 'chat:typing'       // User is typing
  | 'chat:stop_typing'  // User stopped typing
  | 'chat:read'         // Messages marked as read
  | 'chat:reaction'     // Message reaction added/removed
  | 'chat:edit'         // Message edited
  | 'chat:delete'       // Message deleted
  | 'chat:join'         // User joined chat room
  | 'chat:leave'        // User left chat room
  | 'presence:online'   // User came online
  | 'presence:offline'  // User went offline
  | 'error'             // Error message
  | 'ping'              // Keep-alive ping
  | 'pong';             // Keep-alive pong

export interface WSMessage {
  type: WSMessageType;
  chatId?: number;
  data?: any;
  timestamp?: string;
}

interface ClientData {
  userId?: number;
  userRole?: 'client' | 'seller' | 'admin';
  userName?: string;
  chatRooms: Set<number>;
  isAlive: boolean;
  lastActivity: Date;
}

// Store connected clients with their metadata
const clients = new Map<number, WebSocket>(); // userId -> client
const clientData = new Map<WebSocket, ClientData>(); // ws -> metadata
const chatRooms = new Map<number, Set<number>>(); // chatId -> Set of userIds

let wss: WebSocketServer | null = null;

/**
 * Initialize WebSocket server on existing HTTP server
 */
export function initWebSocket(server: HttpServer): WebSocketServer {
  wss = new WebSocketServer({ 
    server,
    path: '/ws/chat',
  });

  console.log('🔌 WebSocket server initialized at /ws/chat');

  wss.on('connection', handleConnection);

  // Heartbeat interval to detect dead connections
  const heartbeatInterval = setInterval(() => {
    wss?.clients.forEach((ws) => {
      const data = clientData.get(ws);
      if (!data || !data.isAlive) {
        console.log(`💔 Terminating inactive connection: user ${data?.userId}`);
        ws.terminate();
        return;
      }
      data.isAlive = false;
      ws.ping();
    });
  }, 30000); // Check every 30 seconds

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  return wss;
}

/**
 * Handle new WebSocket connection
 */
async function handleConnection(ws: WebSocket, req: IncomingMessage) {
  // Initialize client data
  const data: ClientData = {
    chatRooms: new Set(),
    isAlive: true,
    lastActivity: new Date(),
  };
  clientData.set(ws, data);

  // Parse auth token from query string or cookie
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const token = url.searchParams.get('token') || parseCookieToken(req.headers.cookie);

  if (!token) {
    sendError(ws, 'Authentication required');
    ws.close(4001, 'Authentication required');
    return;
  }

  // Verify token
  try {
    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string') {
      throw new Error('Invalid token');
    }

    // Parse userId as number (JWT stores it as string)
    const rawId = decoded.id || decoded.client_id;
    data.userId = rawId ? parseInt(String(rawId), 10) : undefined;
    data.userRole = (decoded.role as 'client' | 'seller' | 'admin') || (decoded.user_type as 'client' | 'seller' | 'admin') || 'client';
    data.userName = decoded.email || `User ${data.userId}`;

    // Store client connection
    if (data.userId) {
      const existingClient = clients.get(data.userId);
      if (existingClient) {
        // Close existing connection (single connection per user)
        existingClient.close(4000, 'New connection established');
      }
      clients.set(data.userId, ws);
      console.log(`✅ WebSocket connected: ${data.userName} (${data.userRole}) - ID: ${data.userId}`);

      // Notify others that user is online
      broadcastPresence(data.userId, 'online');
    }
  } catch (err) {
    console.error('WebSocket auth error:', err);
    sendError(ws, 'Invalid authentication token');
    ws.close(4002, 'Invalid token');
    return;
  }

  // Handle incoming messages
  ws.on('message', (rawData: RawData) => {
    data.isAlive = true;
    data.lastActivity = new Date();
    handleMessage(ws, rawData);
  });

  // Handle pong (heartbeat response)
  ws.on('pong', () => {
    data.isAlive = true;
  });

  // Handle connection close
  ws.on('close', () => {
    if (data.userId) {
      clients.delete(data.userId);
      
      // Leave all chat rooms
      data.chatRooms.forEach((chatId) => {
        const room = chatRooms.get(chatId);
        if (room) {
          room.delete(data.userId!);
          if (room.size === 0) {
            chatRooms.delete(chatId);
          }
        }
      });

      // Notify others that user is offline
      broadcastPresence(data.userId, 'offline');
      console.log(`❌ WebSocket disconnected: user ${data.userId}`);
    }
    clientData.delete(ws);
  });

  // Handle errors
  ws.on('error', (err) => {
    console.error(`WebSocket error for user ${data.userId}:`, err);
  });

  // Send connection success
  sendMessage(ws, { type: 'pong', data: { connected: true, userId: data.userId, role: data.userRole } });
}

/**
 * Handle incoming WebSocket message
 */
function handleMessage(ws: WebSocket, rawData: RawData) {
  const data = clientData.get(ws);
  if (!data) return;

  try {
    const message: WSMessage = JSON.parse(rawData.toString());

    switch (message.type) {
      case 'ping':
        sendMessage(ws, { type: 'pong', timestamp: new Date().toISOString() });
        break;

      case 'chat:join':
        if (message.chatId) {
          joinChatRoom(ws, message.chatId);
        }
        break;

      case 'chat:leave':
        if (message.chatId) {
          leaveChatRoom(ws, message.chatId);
        }
        break;

      case 'chat:typing':
        if (message.chatId && data.userId) {
          broadcastToRoom(message.chatId, {
            type: 'chat:typing',
            chatId: message.chatId,
            data: { userId: data.userId, userName: data.userName },
            timestamp: new Date().toISOString(),
          }, data.userId);
        }
        break;

      case 'chat:stop_typing':
        if (message.chatId && data.userId) {
          broadcastToRoom(message.chatId, {
            type: 'chat:stop_typing',
            chatId: message.chatId,
            data: { userId: data.userId },
            timestamp: new Date().toISOString(),
          }, data.userId);
        }
        break;

      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  } catch (err) {
    console.error('Error parsing WebSocket message:', err);
    sendError(ws, 'Invalid message format');
  }
}

/**
 * Join a chat room to receive messages
 */
function joinChatRoom(ws: WebSocket, chatId: number) {
  const data = clientData.get(ws);
  if (!data?.userId) return;

  // Add user to room
  if (!chatRooms.has(chatId)) {
    chatRooms.set(chatId, new Set());
  }
  chatRooms.get(chatId)!.add(data.userId);
  data.chatRooms.add(chatId);

  // Notify others in room
  broadcastToRoom(chatId, {
    type: 'chat:join',
    chatId,
    data: { userId: data.userId, userName: data.userName },
    timestamp: new Date().toISOString(),
  }, data.userId);

  console.log(`👥 User ${data.userId} joined chat room ${chatId}`);
}

/**
 * Leave a chat room
 */
function leaveChatRoom(ws: WebSocket, chatId: number) {
  const data = clientData.get(ws);
  if (!data?.userId) return;

  const room = chatRooms.get(chatId);
  if (room) {
    room.delete(data.userId);
    if (room.size === 0) {
      chatRooms.delete(chatId);
    }
  }
  data.chatRooms.delete(chatId);

  // Notify others in room
  broadcastToRoom(chatId, {
    type: 'chat:leave',
    chatId,
    data: { userId: data.userId },
    timestamp: new Date().toISOString(),
  }, data.userId);

  console.log(`👋 User ${data.userId} left chat room ${chatId}`);
}

/**
 * Broadcast message to all users in a chat room
 */
export function broadcastToRoom(chatId: number, message: WSMessage, excludeUserId?: number) {
  const room = chatRooms.get(chatId);
  if (!room) return;

  room.forEach((userId) => {
    if (excludeUserId && userId === excludeUserId) return;
    const ws = clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      sendMessage(ws, message);
    }
  });
}

/**
 * Broadcast message to specific user(s)
 */
export function broadcastToUsers(userIds: number[], message: WSMessage) {
  userIds.forEach((userId) => {
    const ws = clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      sendMessage(ws, message);
    }
  });
}

/**
 * Broadcast presence update
 */
function broadcastPresence(userId: number, status: 'online' | 'offline') {
  const ws = clients.get(userId);
  const data = ws ? clientData.get(ws) : undefined;
  if (!data) return;

  // Broadcast to all chat rooms the user is in
  data.chatRooms.forEach((chatId) => {
    broadcastToRoom(chatId, {
      type: status === 'online' ? 'presence:online' : 'presence:offline',
      chatId,
      data: { userId },
      timestamp: new Date().toISOString(),
    }, userId);
  });
}

/**
 * Send a new chat message notification to room
 */
export function notifyNewMessage(chatId: number, message: any, senderId: number) {
  broadcastToRoom(chatId, {
    type: 'chat:message',
    chatId,
    data: message,
    timestamp: new Date().toISOString(),
  }, senderId); // Exclude sender since they already have the message
}

/**
 * Notify about message edit
 */
export function notifyMessageEdit(chatId: number, messageId: number, newContent: string, editorId: number) {
  broadcastToRoom(chatId, {
    type: 'chat:edit',
    chatId,
    data: { messageId, newContent },
    timestamp: new Date().toISOString(),
  }, editorId);
}

/**
 * Notify about message deletion
 */
export function notifyMessageDelete(chatId: number, messageId: number, deleterId: number) {
  broadcastToRoom(chatId, {
    type: 'chat:delete',
    chatId,
    data: { messageId },
    timestamp: new Date().toISOString(),
  }, deleterId);
}

/**
 * Notify about message reaction
 */
export function notifyMessageReaction(chatId: number, messageId: number, reaction: string, userId: number, action: 'add' | 'remove') {
  broadcastToRoom(chatId, {
    type: 'chat:reaction',
    chatId,
    data: { messageId, reaction, userId, action },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notify about messages being read
 */
export function notifyMessagesRead(chatId: number, readerId: number, messageIds?: number[]) {
  broadcastToRoom(chatId, {
    type: 'chat:read',
    chatId,
    data: { readerId, messageIds },
    timestamp: new Date().toISOString(),
  }, readerId);
}

/**
 * Check if a user is online
 */
export function isUserOnline(userId: number): boolean {
  const ws = clients.get(userId);
  return !!ws && ws.readyState === WebSocket.OPEN;
}

/**
 * Get online users in a chat room
 */
export function getOnlineUsersInRoom(chatId: number): number[] {
  const room = chatRooms.get(chatId);
  if (!room) return [];

  return Array.from(room).filter((userId) => isUserOnline(userId));
}

/**
 * Helper: Send message to client
 */
function sendMessage(ws: WebSocket, message: WSMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

/**
 * Helper: Send error to client
 */
function sendError(ws: WebSocket, error: string) {
  sendMessage(ws, { type: 'error', data: { error }, timestamp: new Date().toISOString() });
}

/**
 * Helper: Parse token from cookie
 */
function parseCookieToken(cookieHeader?: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  return cookies['token'] || cookies['auth_token'] || null;
}

/**
 * Get WebSocket server instance
 */
export function getWSS(): WebSocketServer | null {
  return wss;
}

/**
 * Get number of connected clients
 */
export function getConnectedClientsCount(): number {
  return clients.size;
}

/**
 * Get stats about WebSocket server
 */
export function getWSStats() {
  return {
    connectedClients: clients.size,
    activeRooms: chatRooms.size,
    roomDetails: Array.from(chatRooms.entries()).map(([chatId, users]) => ({
      chatId,
      userCount: users.size,
    })),
  };
}
