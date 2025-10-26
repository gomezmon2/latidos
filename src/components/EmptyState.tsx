import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * EmptyState Component
 * Componente reutilizable para mostrar estados vacíos con ilustración
 */
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className} animate-fade-in`}>
      <div className="mb-6 p-6 rounded-full bg-muted/50">
        <Icon className="h-16 w-16 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg" className="gap-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
