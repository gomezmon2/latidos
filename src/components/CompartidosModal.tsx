import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Inbox, Send, Check, X, Loader2 } from "lucide-react";
import { ConnectionService } from "@/services/connection.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { ConnectionRequest } from "@/types/connection";

interface CompartidosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CompartidosModal = ({ open, onOpenChange }: CompartidosModalProps) => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      loadAllData();
    }
  }, [open, user]);

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
              <Avatar className="h-10 w-10">
                <AvatarImage src={request.other_user_avatar || undefined} />
                <AvatarFallback>
                  {request.other_user_name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">
                  {request.other_user_name || "Usuario desconocido"}
                </p>
                <p className="text-xs text-muted-foreground">
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
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Compartidos
          </DialogTitle>
          <DialogDescription>
            Gestiona tus conexiones y solicitudes
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 mt-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <Tabs defaultValue="connections" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="connections" className="text-xs sm:text-sm">
                <Users className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Compartidos</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {connections.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs sm:text-sm">
                <Inbox className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Recibidas</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {pendingRequests.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="sent" className="text-xs sm:text-sm">
                <Send className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Enviadas</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {sentRequests.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="connections" className="mt-4 space-y-3">
              {connections.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Aún no tienes compartidos.</p>
                    <p className="text-xs mt-1">
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

            <TabsContent value="pending" className="mt-4 space-y-3">
              {pendingRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No tienes solicitudes pendientes.</p>
                  </CardContent>
                </Card>
              ) : (
                pendingRequests.map((request) => (
                  <ConnectionCard key={request.id} request={request} showActions />
                ))
              )}
            </TabsContent>

            <TabsContent value="sent" className="mt-4 space-y-3">
              {sentRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No has enviado solicitudes.</p>
                  </CardContent>
                </Card>
              ) : (
                sentRequests.map((request) => (
                  <ConnectionCard key={request.id} request={request} />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
