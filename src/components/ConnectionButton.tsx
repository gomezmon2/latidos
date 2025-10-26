import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Clock, Loader2, Check, X } from "lucide-react";
import { ConnectionService } from "@/services/connection.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { ConnectionStatus } from "@/types/connection";

interface ConnectionButtonProps {
  userId: string;
  userName?: string;
}

export function ConnectionButton({ userId, userName }: ConnectionButtonProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [isSender, setIsSender] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadConnectionStatus();
  }, [userId]);

  const loadConnectionStatus = async () => {
    if (!user || user.id === userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const connection = await ConnectionService.getConnectionBetweenUsers(
        user.id,
        userId
      );

      if (connection) {
        setStatus(connection.status);
        setConnectionId(connection.id);
        // Verificar si el usuario actual es quien envió la solicitud
        setIsSender(connection.user_id === user.id);
      } else {
        setStatus(null);
        setConnectionId(null);
        setIsSender(false);
      }
    } catch (error) {
      console.error("Error loading connection status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async () => {
    setIsProcessing(true);
    try {
      await ConnectionService.sendConnectionRequest({
        shared_user_id: userId,
      });
      toast.success(`Solicitud enviada a ${userName || "el usuario"}`);
      await loadConnectionStatus();
    } catch (error: any) {
      toast.error(error.message || "No se pudo enviar la solicitud");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!connectionId) return;

    setIsProcessing(true);
    try {
      await ConnectionService.deleteConnection(connectionId);
      toast.success("Solicitud cancelada");
      await loadConnectionStatus();
    } catch (error: any) {
      toast.error(error.message || "No se pudo cancelar la solicitud");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveConnection = async () => {
    if (!connectionId) return;

    if (
      !window.confirm(
        `¿Estás seguro de eliminar la conexión con ${userName || "este usuario"}?`
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      await ConnectionService.deleteConnection(connectionId);
      toast.success("Conexión eliminada");
      await loadConnectionStatus();
    } catch (error: any) {
      toast.error(error.message || "No se pudo eliminar la conexión");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!connectionId) return;

    setIsProcessing(true);
    try {
      await ConnectionService.acceptConnectionRequest(connectionId);
      toast.success(`Ahora compartes con ${userName || "este usuario"}`);
      await loadConnectionStatus();
    } catch (error: any) {
      toast.error(error.message || "No se pudo aceptar la solicitud");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!connectionId) return;

    setIsProcessing(true);
    try {
      await ConnectionService.rejectConnectionRequest(connectionId);
      toast.success("Solicitud rechazada");
      await loadConnectionStatus();
    } catch (error: any) {
      toast.error(error.message || "No se pudo rechazar la solicitud");
    } finally {
      setIsProcessing(false);
    }
  };

  // No mostrar nada si es el propio usuario
  if (!user || user.id === userId) {
    return null;
  }

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Cargando...
      </Button>
    );
  }

  // No hay conexión: mostrar botón para enviar solicitud
  if (!status) {
    return (
      <Button
        onClick={handleSendRequest}
        disabled={isProcessing}
        className="gap-2"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        Agregar a Compartidos
      </Button>
    );
  }

  // Solicitud pendiente
  if (status === "pending") {
    // Si YO envié la solicitud: mostrar botón para cancelar
    if (isSender) {
      return (
        <Button
          variant="outline"
          onClick={handleCancelRequest}
          disabled={isProcessing}
          className="gap-2"
          title="Click para cancelar la solicitud"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Clock className="h-4 w-4" />
          )}
          Pendiente
        </Button>
      );
    }

    // Si YO recibí la solicitud: mostrar botones para aceptar/rechazar
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleAcceptRequest}
          disabled={isProcessing}
          title="Aceptar solicitud"
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
          onClick={handleRejectRequest}
          disabled={isProcessing}
          title="Rechazar solicitud"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  // Conexión aceptada
  if (status === "accepted") {
    return (
      <Button
        variant="secondary"
        onClick={handleRemoveConnection}
        disabled={isProcessing}
        className="gap-2"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserCheck className="h-4 w-4" />
        )}
        Compartido
      </Button>
    );
  }

  // Solicitud rechazada: permitir enviar nueva
  if (status === "rejected") {
    return (
      <Button
        variant="outline"
        onClick={handleSendRequest}
        disabled={isProcessing}
        className="gap-2"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        Enviar solicitud
      </Button>
    );
  }

  return null;
}
