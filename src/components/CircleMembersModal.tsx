import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { CircleService } from "@/services/circle.service";
import { ConnectionService } from "@/services/connection.service";
import { Loader2, UserPlus, UserMinus, Search } from "lucide-react";
import type { Circle, CircleMemberWithProfile } from "@/types/circle";
import type { ConnectionRequest } from "@/types/connection";

interface CircleMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  circle: Circle | null;
}

export const CircleMembersModal = ({ isOpen, onClose, circle }: CircleMembersModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [members, setMembers] = useState<CircleMemberWithProfile[]>([]);
  const [availableConnections, setAvailableConnections] = useState<ConnectionRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen && circle) {
      loadData();
    }
  }, [isOpen, circle]);

  const loadData = async () => {
    if (!circle) return;

    setIsLoading(true);
    try {
      // Load current members
      const membersData = await CircleService.getCircleMembers(circle.id);
      setMembers(membersData);

      // Load all connections to show available users to add
      const connectionsData = await ConnectionService.getMyConnections();

      // Filter out users already in the circle
      const memberIds = new Set(membersData.map(m => m.user_id));
      const available = connectionsData.filter(
        conn => !memberIds.has(conn.other_user_id)
      );
      setAvailableConnections(available);
    } catch (error: any) {
      toast({
        title: "Error al cargar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!circle) return;

    setIsAdding(true);
    try {
      await CircleService.addMemberToCircle(circle.id, userId);

      toast({
        title: "Miembro añadido",
        description: "El usuario ha sido añadido al círculo",
      });

      // Reload data
      await loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo añadir el miembro",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!circle) return;

    if (!window.confirm("¿Estás seguro de que quieres eliminar este miembro del círculo?")) {
      return;
    }

    try {
      await CircleService.removeMemberFromCircle(circle.id, userId);

      toast({
        title: "Miembro eliminado",
        description: "El usuario ha sido eliminado del círculo",
      });

      // Reload data
      await loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el miembro",
        variant: "destructive",
      });
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

  const filteredConnections = availableConnections.filter(conn =>
    conn.other_user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!circle) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: circle.color }}
            />
            Gestionar miembros: {circle.name}
          </DialogTitle>
          <DialogDescription>
            Añade o elimina personas de este círculo
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Members Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">
                Miembros actuales ({members.length})
              </h3>
              {members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/30">
                  <p className="text-sm">Este círculo no tiene miembros aún</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[200px] rounded-md border p-3">
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div
                        key={member.user_id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={member.avatar_url || undefined}
                              alt={member.full_name || "Usuario"}
                            />
                            <AvatarFallback>
                              {getInitials(member.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {member.full_name || "Usuario sin nombre"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.user_id)}
                        >
                          <UserMinus className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Add Members Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">
                Añadir miembros ({availableConnections.length} disponibles)
              </h3>

              {availableConnections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/30">
                  <p className="text-sm">
                    Todos tus compartidos ya están en este círculo
                  </p>
                </div>
              ) : (
                <>
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Available Connections */}
                  <ScrollArea className="max-h-[200px] rounded-md border p-3">
                    {filteredConnections.length === 0 ? (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        No se encontraron usuarios
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredConnections.map((connection) => (
                          <div
                            key={connection.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={connection.other_user_avatar || undefined}
                                  alt={connection.other_user_name || "Usuario"}
                                />
                                <AvatarFallback>
                                  {getInitials(connection.other_user_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {connection.other_user_name || "Usuario sin nombre"}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddMember(connection.other_user_id)}
                              disabled={isAdding}
                            >
                              <UserPlus className="h-4 w-4 text-green-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
