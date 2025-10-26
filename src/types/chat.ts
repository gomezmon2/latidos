/**
 * Chat Types
 * TypeScript definitions for Chat/Messaging system
 */

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationWithDetails extends Conversation {
  user1_name: string | null;
  user1_avatar: string | null;
  user2_name: string | null;
  user2_avatar: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface MessageWithSender extends Message {
  sender_name: string | null;
  sender_avatar: string | null;
}

// DTOs
export interface CreateMessageDTO {
  conversation_id: string;
  content: string;
}

export interface ConversationListItem {
  conversation: ConversationWithDetails;
  last_message: Message | null;
  unread_count: number;
  other_user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}
