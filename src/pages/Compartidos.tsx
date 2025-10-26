import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Inbox, Send, Check, X, Loader2, MessageCircle, Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { UserSearchBar } from "@/components/UserSearchBar";
import { ConnectionService } from "@/services/connection.service";
import { ConversationService } from "@/services/conversation.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { ROUTES } from "@/routes";
import type { ConnectionRequest } from "@/types/connection";

export default function Compartidos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [connectionsData, pendingData, sentData] = await Promise.all([
        ConnectionService.getMyConnections(),
        ConnectionService.getPendingRequests(),
        ConnectionService.getSentRequests(),
      ]);

      setConnections(connectionsData);
      setPendingRequests(pendingData);
      setSentRequests(sentData);
    } catch (error: any) {
      toast.error(error.message || "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (connectionId: string) => {
    setProcessingId(connectionId);
    try {
      await ConnectionService.acceptConnectionRequest(connectionId);
      toast.success("Solicitud aceptada");
      await loadAllData();
    } catch (error: any) {
      toast.error(error.message || "Error al aceptar solicitud");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (connectionId: string) => {
    setProcessingId(connectionId);
    try {
      await ConnectionService.rejectConnectionRequest(connectionId);
      toast.success("Solicitud rechazada");
      await loadAllData();
    } catch (error: any) {
      toast.error(error.message || "Error al rechazar solicitud");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelRequest = async (connectionId: string) => {
    setProcessingId(connectionId);
    try {
      await ConnectionService.deleteConnection(connectionId);
      toast.success("Solicitud cancelada");
      await loadAllData();
    } catch (error: any) {
      toast.error(error.message || "Error al cancelar solicitud");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveConnection = async (connectionId: string, userName: string) => {
    if (!window.confirm(`¿Eliminar conexión con ${userName}?`)) {
      return;
    }

    setProcessingId(connectionId);
    try {
      await ConnectionService.deleteConnection(connectionId);
      toast.success("Conexión eliminada");
      await loadAllData();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar conexión");
    } finally {
      setProcessingId(null);
    }
  };

  const handleStartChat = async (otherUserId: string) => {
    setProcessingId(otherUserId);
    try {
      const conversation = await ConversationService.getOrCreateConversation(otherUserId);
      navigate(`${ROUTES.CHAT}/${conversation.id}`);
    } catch (error: any) {
      toast.error(error.message || "Error al iniciar conversación");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSendConnectionRequest = async (userId: string) => {
    try {
      await ConnectionService.sendConnectionRequest({
        shared_user_id: userId,
      });
      // Recargar solicitudes enviadas para mostrar la nueva
      await loadAllData();
    } catch (error: any) {
      throw error; // Re-lanzar para que UserSearchBar maneje el error
    }
  };

  // Obtener IDs de usuarios que ya son compartidos o tienen solicitudes pendientes
  const getExcludedUserIds = (): string[] => {
    const connectedIds = connections.map((c) => c.other_user_id);
    const pendingIds = pendingRequests.map((r) => r.other_user_id);
    const sentIds = sentRequests.map((r) => r.other_user_id);

    return [...connectedIds, ...pendingIds, ...sentIds];
  };

  const ConnectionCard = ({
    request,
    showActions = false,
  }: {
    request: ConnectionRequest;
    showActions?: boolean;
  }) => {
    const isProcessing = processingId === request.id;

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={request.other_user_avatar || undefined} />
                <AvatarFallback>
                  {request.other_user_name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {request.other_user_name || "Usuario desconocido"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(request.created_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
            </div>

            {showActions && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAcceptRequest(request.id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRejectRequest(request.id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            {!showActions && request.status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCancelRequest(request.id)}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
            )}

            {!showActions && request.status === "accepted" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleStartChat(request.other_user_id)}
                  disabled={isProcessing}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Mensaje
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    handleRemoveConnection(
                      request.id,
                      request.other_user_name || "este usuario"
                    )
                  }
                  disabled={isProcessing}
                >
                  Eliminar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <main className="container mx-auto px-6 py-8 max-w-4xl">
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Compartidos</h1>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-sm">
              <Users className="h-3 w-3 mr-1" />
              {connections.length}
            </Badge>
            {pendingRequests.length > 0 && (
              <Badge variant="default" className="text-sm">
                <Inbox className="h-3 w-3 mr-1" />
                {pendingRequests.length}
              </Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </TabsTrigger>
            <TabsTrigger value="connections">
              <Users className="h-4 w-4 mr-2" />
              Compartidos ({connections.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              <Inbox className="h-4 w-4 mr-2" />
              Recibidas ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              <Send className="h-4 w-4 mr-2" />
              Enviadas ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Buscar Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <UserSearchBar
                  onAddShared={handleSendConnectionRequest}
                  excludeUserIds={getExcludedUserIds()}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections" className="mt-6 space-y-4">
            {connections.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aún no tienes compartidos.</p>
                  <p className="text-sm mt-1">
                    Busca usuarios y envíales solicitudes para conectar
                  </p>
                </CardContent>
              </Card>
            ) : (
              connections.map((request) => (
                <ConnectionCard key={request.id} request={request} />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6 space-y-4">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tienes solicitudes pendientes.</p>
                </CardContent>
              </Card>
            ) : (
              pendingRequests.map((request) => (
                <ConnectionCard key={request.id} request={request} showActions />
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="mt-6 space-y-4">
            {sentRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No has enviado solicitudes.</p>
                </CardContent>
              </Card>
            ) : (
              sentRequests.map((request) => (
                <ConnectionCard key={request.id} request={request} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
