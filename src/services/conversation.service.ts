import { supabase } from "@/integrations/supabase/client";
import type {
  Conversation,
  ConversationWithDetails,
  ConversationListItem,
} from "@/types/chat";

/**
 * ConversationService
 * Service for managing chat conversations
 */
export class ConversationService {
  /**
   * Get all conversations for the current user
   */
  static async getMyConversations(): Promise<ConversationListItem[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    // Get conversations
    const { data: conversations, error: convError } = await supabase
      .from("conversations_with_details")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (convError) throw convError;

    // For each conversation, get last message and unread count
    const conversationsWithDetails = await Promise.all(
      (conversations || []).map(async (conv: any) => {
        // Get last message
        const { data: lastMessage } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Count unread messages
        const { count: unreadCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .eq("is_read", false)
          .neq("sender_id", user.id);

        // Determine other user
        const isUser1 = conv.user1_id === user.id;
        const otherUser = {
          id: isUser1 ? conv.user2_id : conv.user1_id,
          name: isUser1 ? conv.user2_name : conv.user1_name,
          avatar: isUser1 ? conv.user2_avatar : conv.user1_avatar,
        };

        return {
          conversation: conv as ConversationWithDetails,
          last_message: lastMessage,
          unread_count: unreadCount || 0,
          other_user: otherUser,
        };
      })
    );

    return conversationsWithDetails;
  }

  /**
   * Get or create a conversation with another user
   */
  static async getOrCreateConversation(
    otherUserId: string
  ): Promise<Conversation> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    // Order user IDs (smaller first)
    const user1 = user.id < otherUserId ? user.id : otherUserId;
    const user2 = user.id < otherUserId ? otherUserId : user.id;

    // Check if conversation already exists
    const { data: existing, error: searchError } = await supabase
      .from("conversations")
      .select("*")
      .eq("user1_id", user1)
      .eq("user2_id", user2)
      .maybeSingle();

    if (searchError) throw searchError;

    // If exists, return it
    if (existing) {
      return existing as Conversation;
    }

    // Otherwise create new conversation
    const { data: newConv, error: createError } = await supabase
      .from("conversations")
      .insert([
        {
          user1_id: user1,
          user2_id: user2,
        },
      ])
      .select()
      .single();

    if (createError) throw createError;

    return newConv as Conversation;
  }

  /**
   * Get a specific conversation by ID
   */
  static async getConversationById(
    conversationId: string
  ): Promise<ConversationWithDetails | null> {
    const { data, error } = await supabase
      .from("conversations_with_details")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data as ConversationWithDetails;
  }

  /**
   * Delete a conversation (and all its messages)
   */
  static async deleteConversation(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);

    if (error) throw error;
  }
}
