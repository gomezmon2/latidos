import { AlertCircle, Info, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorMessageProps {
  title?: string;
  message: string;
  suggestions?: string[];
  type?: "error" | "warning" | "info" | "success";
  className?: string;
}

/**
 * ErrorMessage Component
 * Muestra mensajes de error/warning/info con sugerencias útiles
 */
export const ErrorMessage = ({
  title,
  message,
  suggestions = [],
  type = "error",
  className = "",
}: ErrorMessageProps) => {
  const getIcon = () => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      case "warning":
        return <AlertCircle className="h-4 w-4" />;
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "info":
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case "error":
        return "destructive";
      case "success":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Alert variant={getVariant()} className={`${className} animate-fade-in`}>
      {getIcon()}
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>
        <p className="mb-2">{message}</p>
        {suggestions.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-sm font-medium">Sugerencias:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};
