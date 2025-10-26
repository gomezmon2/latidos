import { Outlet } from "react-router-dom";
import { MessageNotifications } from "./MessageNotifications";

/**
 * AppWrapper Component
 * Wrapper que incluye componentes globales que necesitan acceso al router
 */
export const AppWrapper = () => {
  return (
    <>
      <MessageNotifications />
      <Outlet />
    </>
  );
};
