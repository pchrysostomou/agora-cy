-- =====================================================
-- Session 4 Migration — Realtime + Messaging indexes
-- Run in: Supabase Dashboard → SQL Editor
-- =====================================================

-- Enable Realtime on messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Also enable on orders (for order status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Compound index for conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON messages(listing_id, sender_id, receiver_id, created_at DESC);

-- Unread count fast query
CREATE INDEX IF NOT EXISTS idx_messages_unread
  ON messages(receiver_id, read)
  WHERE read = FALSE;

-- Function to mark conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_read(
  p_listing_id UUID,
  p_receiver_id UUID
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE messages
  SET read = TRUE
  WHERE listing_id = p_listing_id
    AND receiver_id = p_receiver_id
    AND read = FALSE;
END;
$$;

-- Function to get unread count for a user
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COUNT(*)::INTEGER
  FROM messages
  WHERE receiver_id = p_user_id AND read = FALSE;
$$;
