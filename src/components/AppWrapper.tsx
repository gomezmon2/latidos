import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { MessageNotifications } from "./MessageNotifications";
import { FloatingActionButton } from "./FloatingActionButton";
import { ScrollToTop } from "./ScrollToTop";
import { NotificationPermission } from "./NotificationPermission";

/**
 * AppWrapper Component
 * Wrapper que incluye componentes globales que necesitan acceso al router
 */
export const AppWrapper = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Escuchar mensajes del service worker (clicks en notificaciones)
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        const url = event.data.url;
        // Extraer la ruta relativa de la URL completa
        const path = url.replace(window.location.origin, '');
        navigate(path);
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [navigate]);

  return (
    <>
      <MessageNotifications />
      <FloatingActionButton />
      <ScrollToTop />
      <NotificationPermission />
      <Outlet />
    </>
  );
};
