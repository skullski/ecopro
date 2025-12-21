// Chat System Types

import { z } from 'zod';

// Database Models
export interface Chat {
  id: number;
  client_id: number;
  seller_id: number;
  store_id?: number;
  status: 'active' | 'archived' | 'closed';
  created_at: Date;
  updated_at: Date;
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  sender_id: number;
  sender_type: 'client' | 'seller';
  message_content: string;
  message_type: 'text' | 'code_request' | 'code_response' | 'system';
  metadata?: Record<string, any>;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CodeRequest {
  id: number;
  chat_id: number;
  client_id: number;
  seller_id: number;
  requested_code_type?: string;
  generated_code?: string;
  expiry_date?: Date;
  status: 'pending' | 'issued' | 'used' | 'expired';
  created_at: Date;
  issued_at?: Date;
  used_at?: Date;
}

export interface SellerNotificationSettings {
  id: number;
  seller_id: number;
  chat_notifications_enabled: boolean;
  email_on_new_message: boolean;
  mute_until?: Date;
  created_at: Date;
  updated_at: Date;
}

// API Request/Response Types
export interface ChatResponse extends Chat {
  unread_count?: number;
  last_message?: ChatMessage;
  client?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ChatDetailResponse extends ChatResponse {
  messages: ChatMessage[];
  code_requests?: CodeRequest[];
}

// Zod Validation Schemas

export const SendMessageSchema = z.object({
  chat_id: z.number().positive(),
  message_content: z.string().min(1).max(5000),
  message_type: z.enum(['text', 'code_request', 'system']).optional(),
  metadata: z.record(z.any()).optional(),
});

export const CreateChatSchema = z.object({
  client_id: z.number().positive(),
  seller_id: z.number().positive(),
  store_id: z.number().positive().optional(),
});

export const RequestCodeSchema = z.object({
  chat_id: z.number().positive(),
  code_type: z.string().min(1).max(100),
  expiry_hours: z.number().positive().optional().default(24),
});

export const IssueCodeSchema = z.object({
  request_id: z.number().positive(),
  code: z.string().min(3).max(255),
});

export const MarkMessagesReadSchema = z.object({
  chat_id: z.number().positive(),
  message_ids: z.array(z.number().positive()).optional(),
});

export const UpdateChatStatusSchema = z.object({
  chat_id: z.number().positive(),
  status: z.enum(['active', 'archived', 'closed']),
});

// Type inference from Zod schemas
export type SendMessage = z.infer<typeof SendMessageSchema>;
export type CreateChat = z.infer<typeof CreateChatSchema>;
export type RequestCode = z.infer<typeof RequestCodeSchema>;
export type IssueCode = z.infer<typeof IssueCodeSchema>;
export type MarkMessagesRead = z.infer<typeof MarkMessagesReadSchema>;
export type UpdateChatStatus = z.infer<typeof UpdateChatStatusSchema>;
