import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Message } from "@/types/chat";
import { ROUTES } from "@/routes";

export const MessageNotifications = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const previousMessageIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    // No hacer nada si no hay usuario autenticado
    if (!user) return;

    const channel = supabase
      .channel("new-message-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const newMessage = payload.new as Message;

          // Evitar notificación de mensajes duplicados
          if (previousMessageIds.current.has(newMessage.id)) {
            return;
          }
          previousMessageIds.current.add(newMessage.id);

          // No notificar si el mensaje es del usuario actual
          if (newMessage.sender_id === user.id) {
            return;
          }

          // No notificar si el usuario está viendo ese chat específico
          const currentChatId = location.pathname.split("/chat/")[1];
          if (currentChatId === newMessage.conversation_id) {
            return;
          }

          // Obtener información del remitente
          const { data: senderProfile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", newMessage.sender_id)
            .single();

          const senderName = senderProfile?.full_name || "Alguien";

          // Truncar mensaje si es muy largo
          const messagePreview = newMessage.content.length > 50
            ? newMessage.content.substring(0, 50) + "..."
            : newMessage.content;

          // Mostrar toast clickeable
          toast(
            `${senderName}`,
            {
              description: messagePreview,
              action: {
                label: "Ver",
                onClick: () => {
                  navigate(`${ROUTES.CHAT}/${newMessage.conversation_id}`);
                },
              },
              duration: 5000,
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, location.pathname, navigate]);

  // Este componente no renderiza nada visible
  return null;
};
