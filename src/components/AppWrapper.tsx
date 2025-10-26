import { Outlet } from "react-router-dom";
import { MessageNotifications } from "./MessageNotifications";
import { FloatingActionButton } from "./FloatingActionButton";
import { ScrollToTop } from "./ScrollToTop";

/**
 * AppWrapper Component
 * Wrapper que incluye componentes globales que necesitan acceso al router
 */
export const AppWrapper = () => {
  return (
    <>
      <MessageNotifications />
      <FloatingActionButton />
      <ScrollToTop />
      <Outlet />
    </>
  );
};
