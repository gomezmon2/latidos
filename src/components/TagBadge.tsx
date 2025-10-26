import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Tag } from "@/types/experience";

interface TagBadgeProps {
  tag: Tag;
  onRemove?: () => void;
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export const TagBadge = ({
  tag,
  onRemove,
  variant = "secondary",
  size = "md"
}: TagBadgeProps) => {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5"
  };

  return (
    <Badge
      variant={variant}
      className={`${sizeClasses[size]} flex items-center gap-1.5 font-normal`}
    >
      {tag.emoji && <span className="text-sm">{tag.emoji}</span>}
      <span>{tag.name}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-destructive transition-colors"
          aria-label={`Eliminar etiqueta ${tag.name}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
};
