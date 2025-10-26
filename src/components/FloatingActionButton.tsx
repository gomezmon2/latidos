import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes";
import { useAuth } from "@/contexts/AuthContext";

/**
 * FloatingActionButton (FAB)
 * Botón flotante para crear nueva historia rápidamente
 */
export const FloatingActionButton = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Solo mostrar si el usuario está autenticado
  if (!user) return null;

  const handleClick = () => {
    navigate(ROUTES.CREATE);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            size="lg"
            className="fixed bottom-6 right-6 h-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 px-6 gap-2"
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Historias</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Crear nueva historia</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
