import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ConversationService } from "@/services/conversation.service";
import { MessageService } from "@/services/message.service";
import { ROUTES } from "@/routes";
import { Navbar } from "@/components/Navbar";
import { Loader2, Send, ArrowLeft } from "lucide-react";
import type { ConversationWithDetails, MessageWithSender } from "@/types/chat";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ChatWindow = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [conversation, setConversation] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
      return;
    }
    if (!id) {
      navigate(ROUTES.CHAT);
      return;
    }
    loadConversation();
    loadMessages();

    // Subscribe to realtime messages
    if (id) {
      channelRef.current = MessageService.subscribeToMessages(id, (newMsg) => {
        // Fetch full message details
        loadMessages();
        // Mark as read if not from current user
        if (newMsg.sender_id !== user.id) {
          MessageService.markMessagesAsRead(id, user.id);
        }
      });
    }

    // Cleanup
    return () => {
      if (channelRef.current) {
        MessageService.unsubscribeFromMessages(channelRef.current);
      }
    };
  }, [user, id, navigate]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    if (!id) return;

    try {
      const data = await ConversationService.getConversationById(id);
      setConversation(data);
    } catch (error: any) {
      toast({
        title: "Error al cargar conversación",
        description: error.message,
        variant: "destructive",
      });
      navigate(ROUTES.CHAT);
    }
  };

  const loadMessages = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const data = await MessageService.getMessages(id);
      setMessages(data);

      // Mark messages as read
      if (user) {
        await MessageService.markMessagesAsRead(id, user.id);
      }
    } catch (error: any) {
      toast({
        title: "Error al cargar mensajes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !id) return;

    setIsSending(true);
    try {
      await MessageService.sendMessage({
        conversation_id: id,
        content: newMessage.trim(),
      });

      setNewMessage("");
      // Messages will update via realtime subscription
    } catch (error: any) {
      toast({
        title: "Error al enviar mensaje",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getOtherUser = () => {
    if (!conversation || !user) return null;
    const isUser1 = conversation.user1_id === user.id;
    return {
      id: isUser1 ? conversation.user2_id : conversation.user1_id,
      name: isUser1 ? conversation.user2_name : conversation.user1_name,
      avatar: isUser1 ? conversation.user2_avatar : conversation.user1_avatar,
    };
  };

  const otherUser = getOtherUser();

  if (!user || !otherUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <Navbar />

      {/* Chat Header */}
      <div className="bg-background border-b px-6 py-4">
        <div className="container mx-auto max-w-4xl flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(ROUTES.CHAT)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <Avatar className="h-10 w-10">
            <AvatarImage
              src={otherUser.avatar || undefined}
              alt={otherUser.name || "Usuario"}
            />
            <AvatarFallback>
              {getInitials(otherUser.name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="font-semibold">
              {otherUser.name || "Usuario sin nombre"}
            </h2>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 container mx-auto max-w-4xl px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-4 pb-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>No hay mensajes aún. ¡Comienza la conversación!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.sender_id === user.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm break-words">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwn
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {format(new Date(message.created_at), "HH:mm", {
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-background border-t px-6 py-4">
        <div className="container mx-auto max-w-4xl">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              disabled={isSending}
              className="flex-1"
            />
            <Button type="submit" disabled={isSending || !newMessage.trim()}>
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
