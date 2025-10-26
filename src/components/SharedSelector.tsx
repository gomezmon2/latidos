import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConnectionService } from "@/services/connection.service";
import { Loader2, Users, UserCheck, CircleDot } from "lucide-react";
import type { ConnectionRequest } from "@/types/connection";
import { CircleSelector } from "@/components/CircleSelector";

interface SharedSelectorProps {
  selectedUserIds: string[];
  onChange: (userIds: string[]) => void;
  shareMode: "all" | "specific" | "circle";
  onShareModeChange: (mode: "all" | "specific" | "circle") => void;
  selectedCircleId?: string | null;
  onCircleChange?: (circleId: string | null) => void;
}

export const SharedSelector = ({
  selectedUserIds,
  onChange,
  shareMode,
  onShareModeChange,
  selectedCircleId,
  onCircleChange,
}: SharedSelectorProps) => {
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setIsLoading(true);
      const data = await ConnectionService.getMyConnections();
      setConnections(data);
    } catch (error) {
      console.error("Error loading connections:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onChange(selectedUserIds.filter(id => id !== userId));
    } else {
      onChange([...selectedUserIds, userId]);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No tienes compartidos aún</p>
        <p className="text-xs mt-1">Las historias privadas solo las verás tú</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Share Mode Selection */}
      <RadioGroup
        value={shareMode}
        onValueChange={(value) => onShareModeChange(value as "all" | "specific" | "circle")}
        className="space-y-3"
      >
        <div className="flex items-start space-x-3 space-y-0">
          <RadioGroupItem value="all" id="share-all" />
          <div className="flex-1">
            <Label
              htmlFor="share-all"
              className="font-normal cursor-pointer flex items-center gap-2"
            >
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Compartir con todos mis compartidos</span>
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Todos tus compartidos aceptados podrán ver esta historia ({connections.length} {connections.length === 1 ? 'persona' : 'personas'})
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 space-y-0">
          <RadioGroupItem value="circle" id="share-circle" />
          <div className="flex-1">
            <Label
              htmlFor="share-circle"
              className="font-normal cursor-pointer flex items-center gap-2"
            >
              <CircleDot className="h-4 w-4 text-violet-600" />
              <span className="font-medium">Compartir con un círculo</span>
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Comparte con un grupo específico de personas
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 space-y-0">
          <RadioGroupItem value="specific" id="share-specific" />
          <div className="flex-1">
            <Label
              htmlFor="share-specific"
              className="font-normal cursor-pointer flex items-center gap-2"
            >
              <UserCheck className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Compartir con compartidos específicos</span>
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Selecciona individualmente con quién compartir esta historia
            </p>
          </div>
        </div>
      </RadioGroup>

      {/* Circle Selector (only when circle mode) */}
      {shareMode === "circle" && onCircleChange && (
        <div className="mt-4">
          <CircleSelector
            selectedCircleId={selectedCircleId || null}
            onChange={onCircleChange}
          />
        </div>
      )}

      {/* Connection List (only when specific mode) */}
      {shareMode === "specific" && (
        <div className="mt-4 space-y-2">
          <Label className="text-sm text-muted-foreground">
            Selecciona personas ({selectedUserIds.length} seleccionada{selectedUserIds.length !== 1 ? 's' : ''})
          </Label>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="space-y-3">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedUserIds.includes(connection.other_user_id)}
                    onCheckedChange={() => handleToggleUser(connection.other_user_id)}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={connection.other_user_avatar || undefined}
                      alt={connection.other_user_name || "Usuario"}
                    />
                    <AvatarFallback>
                      {getInitials(connection.other_user_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {connection.other_user_name || "Usuario sin nombre"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
