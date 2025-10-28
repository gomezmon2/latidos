import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationService } from "@/services/notification.service";
import { useToast } from "@/hooks/use-toast";

/**
 * NotificationPermission Component
 * Solicita permisos de notificaciones push al usuario
 */
export const NotificationPermission = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Verificar soporte y estado inicial
    const supported = NotificationService.isSupported();
    setIsSupported(supported);

    if (supported) {
      setPermissionStatus(NotificationService.getPermissionStatus());
    }

    // Verificar si el usuario ya dismisseó el banner
    const dismissed = localStorage.getItem('notification-banner-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      const permission = await NotificationService.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        // Inicializar el servicio
        await NotificationService.initialize();

        toast({
          title: "✅ Notificaciones activadas",
          description: "Recibirás notificaciones de nuevos mensajes y actividad",
        });

        // Ocultar el banner
        setIsDismissed(true);
        localStorage.setItem('notification-banner-dismissed', 'true');
      } else {
        toast({
          title: "❌ Permiso denegado",
          description: "No podrás recibir notificaciones. Puedes cambiar esto en la configuración de tu navegador.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron activar las notificaciones",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('notification-banner-dismissed', 'true');
  };

  // No mostrar si:
  // - No hay usuario autenticado
  // - No están soportadas
  // - Ya están concedidas
  // - Usuario dismisseó el banner
  if (!user || !isSupported || permissionStatus === 'granted' || isDismissed) {
    return null;
  }

  return (
    <Card className="fixed bottom-24 right-6 max-w-md z-40 shadow-lg animate-slide-in-right">
      <CardHeader className="relative pb-3">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Activa las notificaciones</CardTitle>
            <CardDescription className="text-sm">
              Mantente al día con mensajes y actividad
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Nuevos mensajes de tus compartidos</li>
          <li>• Comentarios en tus historias</li>
          <li>• Solicitudes de conexión</li>
        </ul>
        <div className="flex gap-2">
          <Button
            onClick={handleRequestPermission}
            disabled={isLoading}
            className="flex-1 gap-2"
          >
            <Bell className="h-4 w-4" />
            {isLoading ? "Activando..." : "Activar notificaciones"}
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="gap-2"
          >
            Ahora no
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
