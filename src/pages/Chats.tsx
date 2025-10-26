import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ConversationService } from "@/services/conversation.service";
import { ROUTES } from "@/routes";
import { Navbar } from "@/components/Navbar";
import { Loader2, MessageCircle } from "lucide-react";
import type { ConversationListItem } from "@/types/chat";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const Chats = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
      return;
    }
    loadConversations();
  }, [user, navigate]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const data = await ConversationService.getMyConversations();
      setConversations(data);
    } catch (error: any) {
      toast({
        title: "Error al cargar conversaciones",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`${ROUTES.CHAT}/${conversationId}`);
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

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: es,
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mensajes</h1>
          <p className="text-muted-foreground">
            Tus conversaciones con compartidos
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <MessageCircle className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No tienes conversaciones</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Inicia una conversación con tus compartidos desde su perfil
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((item) => (
              <Card
                key={item.conversation.id}
                className="hover:shadow-md hover:bg-accent/50 transition-all cursor-pointer"
                onClick={() => handleConversationClick(item.conversation.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={item.other_user.avatar || undefined}
                        alt={item.other_user.name || "Usuario"}
                      />
                      <AvatarFallback>
                        {getInitials(item.other_user.name)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">
                          {item.other_user.name || "Usuario sin nombre"}
                        </h3>
                        {item.last_message && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(item.last_message.created_at)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {item.last_message?.content || "Sin mensajes aún"}
                        </p>
                        {item.unread_count > 0 && (
                          <Badge variant="default" className="ml-2">
                            {item.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Chats;
