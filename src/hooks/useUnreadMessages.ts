import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UnreadMessagesData {
  totalUnread: number;
  unreadByConversation: Map<string, number>;
}

export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadData, setUnreadData] = useState<UnreadMessagesData>({
    totalUnread: 0,
    unreadByConversation: new Map(),
  });
  const [loading, setLoading] = useState(true);

  // Función para cargar mensajes no leídos
  const loadUnreadMessages = async () => {
    if (!user) {
      setUnreadData({
        totalUnread: 0,
        unreadByConversation: new Map(),
      });
      setLoading(false);
      return;
    }

    try {
      // Obtener todas las conversaciones del usuario
      const { data: conversations, error: convError } = await supabase
        .from("conversations")
        .select("id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (convError) throw convError;
      if (!conversations || conversations.length === 0) {
        setUnreadData({
          totalUnread: 0,
          unreadByConversation: new Map(),
        });
        setLoading(false);
        return;
      }

      const conversationIds = conversations.map((c) => c.id);

      // Obtener mensajes no leídos de todas las conversaciones
      const { data: unreadMessages, error: msgError } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id")
        .in("conversation_id", conversationIds)
        .eq("is_read", false)
        .neq("sender_id", user.id); // Solo mensajes que NO envió el usuario actual

      if (msgError) throw msgError;

      // Construir el mapa de no leídos por conversación
      const unreadMap = new Map<string, number>();
      let total = 0;

      if (unreadMessages) {
        unreadMessages.forEach((msg) => {
          const count = unreadMap.get(msg.conversation_id) || 0;
          unreadMap.set(msg.conversation_id, count + 1);
          total++;
        });
      }

      setUnreadData({
        totalUnread: total,
        unreadByConversation: unreadMap,
      });
    } catch (error) {
      console.error("Error loading unread messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar y cuando cambia el usuario
  useEffect(() => {
    loadUnreadMessages();
  }, [user]);

  // Suscripción en tiempo real a nuevos mensajes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("unread-messages-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          // Recargar el conteo cuando hay cambios
          loadUnreadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    ...unreadData,
    loading,
    refresh: loadUnreadMessages,
  };
};
