import { supabase } from "@/integrations/supabase/client";
import type { Message, MessageWithSender, CreateMessageDTO } from "@/types/chat";

/**
 * MessageService
 * Service for managing chat messages
 */
export class MessageService {
  /**
   * Get all messages from a conversation
   */
  static async getMessages(conversationId: string): Promise<MessageWithSender[]> {
    // Get messages
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    if (!messages || messages.length === 0) {
      return [];
    }

    // Get unique sender IDs
    const senderIds = [...new Set(messages.map(m => m.sender_id))];

    // Fetch profiles for all senders
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", senderIds);

    const profileMap = new Map(
      (profiles || []).map(p => [p.id, p])
    );

    // Map to MessageWithSender
    return messages.map((msg: any) => {
      const profile = profileMap.get(msg.sender_id);
      return {
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        content: msg.content,
        is_read: msg.is_read,
        created_at: msg.created_at,
        sender_name: profile?.full_name || null,
        sender_avatar: profile?.avatar_url || null,
      };
    });
  }

  /**
   * Send a new message
   */
  static async sendMessage(messageData: CreateMessageDTO): Promise<Message> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          conversation_id: messageData.conversation_id,
          sender_id: user.id,
          content: messageData.content,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data as Message;
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(
    conversationId: string,
    excludeSenderId: string
  ): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .eq("is_read", false)
      .neq("sender_id", excludeSenderId);

    if (error) throw error;
  }

  /**
   * Subscribe to new messages in a conversation (realtime)
   */
  static subscribeToMessages(
    conversationId: string,
    onMessage: (message: Message) => void
  ) {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onMessage(payload.new as Message);
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * Unsubscribe from realtime updates
   */
  static unsubscribeFromMessages(channel: any) {
    supabase.removeChannel(channel);
  }
}
