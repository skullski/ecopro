-- Migration: Add reactions and reply_to_id to chat_messages
-- Date: 2025-01-XX

-- Add reactions column (JSONB for flexibility: { "👍": [1, 2], "❤️": [3] })
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}';

-- Add reply_to_id for threaded replies
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS reply_to_id BIGINT REFERENCES chat_messages(id) ON DELETE SET NULL;

-- Add index for reply lookups
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to_id ON chat_messages(reply_to_id);

-- Add index for reactions (GIN for JSONB)
CREATE INDEX IF NOT EXISTS idx_chat_messages_reactions ON chat_messages USING GIN (reactions);
