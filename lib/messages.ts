import { createClient } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface Message {
  id: string;
  listing_id: string | null;
  order_id: string | null;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: { username: string; full_name: string; avatar_url: string };
}

/** Create a browser-side Supabase client for Realtime */
function getClient(accessToken?: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });
}

/** Fetch conversation messages between two users about a listing */
export async function getMessages(
  listingId: string,
  userId: string,
  otherUserId: string,
  accessToken: string
): Promise<Message[]> {
  const sb = getClient(accessToken);
  const { data, error } = await sb
    .from('messages')
    .select('*, sender:profiles!messages_sender_id_fkey(username, full_name, avatar_url)')
    .eq('listing_id', listingId)
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[getMessages]', error);
    return [];
  }
  return (data ?? []) as Message[];
}

/** Send a message */
export async function sendMessage(
  params: {
    listingId: string;
    senderId: string;
    receiverId: string;
    content: string;
  },
  accessToken: string
): Promise<Message | null> {
  const sb = getClient(accessToken);
  const { data, error } = await sb
    .from('messages')
    .insert({
      listing_id: params.listingId,
      sender_id: params.senderId,
      receiver_id: params.receiverId,
      content: params.content.trim(),
    })
    .select('*, sender:profiles!messages_sender_id_fkey(username, full_name, avatar_url)')
    .single();

  if (error) {
    console.error('[sendMessage]', error);
    return null;
  }
  return data as Message;
}

/** Subscribe to new messages in a conversation — returns unsubscribe fn */
export function subscribeToMessages(
  listingId: string,
  userId: string,
  otherUserId: string,
  onMessage: (msg: Message) => void,
  accessToken: string
): () => void {
  const sb = getClient(accessToken);

  const channel: RealtimeChannel = sb
    .channel(`messages:${listingId}:${[userId, otherUserId].sort().join(':')}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `listing_id=eq.${listingId}`,
      },
      (payload) => {
        const msg = payload.new as Message;
        // Only deliver if it's in our conversation
        if (
          (msg.sender_id === userId && msg.receiver_id === otherUserId) ||
          (msg.sender_id === otherUserId && msg.receiver_id === userId)
        ) {
          onMessage(msg);
        }
      }
    )
    .subscribe();

  return () => { sb.removeChannel(channel); };
}

/** Get unread message count for a user */
export async function getUnreadCount(userId: string, accessToken: string): Promise<number> {
  const sb = getClient(accessToken);
  const { count, error } = await sb
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('read', false);

  if (error) return 0;
  return count ?? 0;
}

/** Mark all messages in a conversation as read */
export async function markConversationRead(
  listingId: string,
  receiverId: string,
  accessToken: string
) {
  const sb = getClient(accessToken);
  await sb
    .from('messages')
    .update({ read: true })
    .eq('listing_id', listingId)
    .eq('receiver_id', receiverId)
    .eq('read', false);
}

/** Get all unique conversations for a user */
export async function getConversations(userId: string, accessToken: string) {
  const sb = getClient(accessToken);

  const { data, error } = await sb
    .from('messages')
    .select(`
      id, listing_id, sender_id, receiver_id, content, read, created_at,
      sender:profiles!messages_sender_id_fkey(username, full_name, avatar_url),
      receiver:profiles!messages_receiver_id_fkey(username, full_name, avatar_url),
      listing:listings!messages_listing_id_fkey(id, title, price)
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getConversations]', error);
    return [];
  }

  // Deduplicate by listing_id + other user
  const seen = new Set<string>();
  const conversations: typeof data = [];
  for (const msg of data ?? []) {
    const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
    const key = `${msg.listing_id}:${otherId}`;
    if (!seen.has(key)) {
      seen.add(key);
      conversations.push(msg);
    }
  }

  return conversations;
}
