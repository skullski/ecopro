// Chat API Routes
// Handles all chat operations with role-based access control

import { Router, Request, Response } from 'express';
import { chatService } from '../services/chat';
import { pool } from '../utils/database';
import {
  SendMessageSchema,
  CreateChatSchema,
  RequestCodeSchema,
  IssueCodeSchema,
  MarkMessagesReadSchema,
  UpdateChatStatusSchema,
} from '../types/chat';
import { ZodError } from 'zod';

const router = Router();

// Middleware to verify user role
const getUserRole = (req: Request): { userId: number; role: 'client' | 'seller' | null } => {
  const user = (req.user as any);
  if (!user) {
    return { userId: 0, role: null };
  }

  // Check if user is a client
  if (user.clientId) {
    return { userId: user.clientId, role: 'client' };
  }

  // Check if user is a seller
  if (user.sellerId) {
    return { userId: user.sellerId, role: 'seller' };
  }

  return { userId: 0, role: null };
};

/**
 * GET /api/chat/list
 * Get list of chats for current user
 */
router.get('/list', async (req: Request, res: Response) => {
  const { userId, role } = getUserRole(req);

  if (!userId || !role) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    let chats;
    if (role === 'client') {
      chats = await chatService.getClientChats(userId);
    } else {
      chats = await chatService.getSellerChats(userId);
    }

    res.json({ chats, total: chats.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/create
 * Create a new chat (client initiates)
 */
router.post('/create', async (req: Request, res: Response) => {
  const { userId, role } = getUserRole(req);

  if (role !== 'client') {
    return res.status(403).json({ error: 'Only clients can create chats' });
  }

  try {
    const data = CreateChatSchema.parse(req.body);

    if (data.client_id !== userId) {
      return res.status(403).json({ error: 'Cannot create chat for another client' });
    }

    const chat = await chatService.getOrCreateChat(
      data.client_id,
      data.seller_id,
      data.store_id
    );

    res.json({ chat, message: 'Chat created or retrieved' });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/chat/:chatId/messages
 * Get messages from a chat
 */
router.get('/:chatId/messages', async (req: Request, res: Response) => {
  const { userId, role } = getUserRole(req);
  const { chatId } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  if (!userId || !role) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Verify user has access to this chat
    const chatCheck = await pool.query('SELECT * FROM chats WHERE id = $1', [chatId]);

    if (chatCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const chat = chatCheck.rows[0];

    if (role === 'client' && chat.client_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to chat' });
    }
    if (role === 'seller' && chat.seller_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to chat' });
    }

    const messages = await chatService.getChatMessages(
      Number(chatId),
      Number(limit),
      Number(offset)
    );

    res.json({ messages, total: messages.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/:chatId/message
 * Send a message
 */
router.post('/:chatId/message', async (req: Request, res: Response) => {
  const { userId, role } = getUserRole(req);
  const { chatId } = req.params;

  if (!userId || !role) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const data = SendMessageSchema.parse(req.body);

    if (data.chat_id !== Number(chatId)) {
      return res.status(400).json({ error: 'Chat ID mismatch' });
    }

    const message = await chatService.sendMessage(
      data.chat_id,
      userId,
      role,
      data.message_content,
      data.message_type,
      data.metadata
    );

    res.json({ message });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/:chatId/mark-read
 * Mark messages as read
 */
router.post('/:chatId/mark-read', async (req: Request, res: Response) => {
  const { userId, role } = getUserRole(req);
  const { chatId } = req.params;

  if (!userId || !role) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await chatService.markMessagesAsRead(Number(chatId), userId, role);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/:chatId/request-code
 * Request a code (client)
 */
router.post('/:chatId/request-code', async (req: Request, res: Response) => {
  const { userId, role } = getUserRole(req);
  const { chatId } = req.params;

  if (role !== 'client') {
    return res.status(403).json({ error: 'Only clients can request codes' });
  }

  try {
    const data = RequestCodeSchema.parse(req.body);

    if (data.chat_id !== Number(chatId)) {
      return res.status(400).json({ error: 'Chat ID mismatch' });
    }

    const codeRequest = await chatService.requestCode(
      data.chat_id,
      userId,
      data.code_type
    );

    res.json({ code_request: codeRequest });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/code-request/:requestId/issue
 * Issue a code (seller)
 */
router.post('/code-request/:requestId/issue', async (req: Request, res: Response) => {
  const { userId, role } = getUserRole(req);
  const { requestId } = req.params;

  if (role !== 'seller') {
    return res.status(403).json({ error: 'Only sellers can issue codes' });
  }

  try {
    const data = IssueCodeSchema.parse(req.body);

    // Verify seller owns this code request
    const requestCheck = await pool.query(
      'SELECT * FROM code_requests WHERE id = $1',
      [requestId]
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Code request not found' });
    }

    const codeReq = requestCheck.rows[0];

    if (codeReq.seller_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await chatService.issueCode(
      Number(requestId),
      data.code,
      24 // 24 hours default expiry
    );

    res.json({ code_request: updated });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/chat/:chatId/codes
 * Get code requests for a chat
 */
router.get('/:chatId/codes', async (req: Request, res: Response) => {
  const { userId, role } = getUserRole(req);
  const { chatId } = req.params;

  if (!userId || !role) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Verify access
    const chatCheck = await pool.query('SELECT * FROM chats WHERE id = $1', [chatId]);

    if (chatCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const chat = chatCheck.rows[0];

    if (role === 'client' && chat.client_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (role === 'seller' && chat.seller_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const codes = await chatService.getCodeRequests(Number(chatId));
    res.json({ codes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/:chatId/status
 * Update chat status (archive/close)
 */
router.post('/:chatId/status', async (req: Request, res: Response) => {
  const { userId, role } = getUserRole(req);
  const { chatId } = req.params;

  if (!userId || !role) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const data = UpdateChatStatusSchema.parse(req.body);

    if (data.chat_id !== Number(chatId)) {
      return res.status(400).json({ error: 'Chat ID mismatch' });
    }

    const updated = await chatService.updateChatStatus(
      Number(chatId),
      userId,
      data.status
    );

    res.json({ chat: updated });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/chat/unread-count
 * Get unread message count (client)
 */
router.get('/unread-count', async (req: Request, res: Response) => {
  const { userId, role } = getUserRole(req);

  if (role !== 'client') {
    return res.status(403).json({ error: 'Only clients have unread counts' });
  }

  try {
    const count = await chatService.getUnreadCount(userId);
    res.json({ unread_count: count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/chat/:chatId
 * Delete a chat (soft delete)
 */
router.delete('/:chatId', async (req: Request, res: Response) => {
  const { userId, role } = getUserRole(req);
  const { chatId } = req.params;

  if (!userId || !role) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Verify ownership
    const chatCheck = await pool.query('SELECT * FROM chats WHERE id = $1', [chatId]);

    if (chatCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const chat = chatCheck.rows[0];

    if (role === 'client' && chat.client_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (role === 'seller' && chat.seller_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await chatService.deleteChat(Number(chatId));
    res.json({ success: true, message: 'Chat archived' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
