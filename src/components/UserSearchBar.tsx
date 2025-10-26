import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { UserService, UserProfile } from "@/services/user.service";
import { toast } from "sonner";

interface UserSearchBarProps {
  onUserSelect?: (user: UserProfile) => void;
  onAddShared: (userId: string) => Promise<void>;
  excludeUserIds?: string[]; // IDs de usuarios que ya son compartidos
}

export const UserSearchBar = ({
  onUserSelect,
  onAddShared,
  excludeUserIds = [],
}: UserSearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await UserService.searchUsers(query, 10);

      // Filtrar usuarios que ya son compartidos
      const filtered = results.filter(
        (user) => !excludeUserIds.includes(user.id)
      );

      setSearchResults(filtered);
    } catch (error: any) {
      console.error("Error searching users:", error);
      toast.error(error.message || "Error al buscar usuarios");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddShared = async (user: UserProfile) => {
    setAddingUserId(user.id);
    try {
      await onAddShared(user.id);
      toast.success(`Solicitud enviada a ${user.full_name || "usuario"}`);

      // Eliminar del resultado de búsqueda
      setSearchResults((prev) => prev.filter((u) => u.id !== user.id));

      if (onUserSelect) {
        onUserSelect(user);
      }
    } catch (error: any) {
      toast.error(error.message || "Error al enviar solicitud");
    } finally {
      setAddingUserId(null);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Buscar usuarios por nombre..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Indicador de búsqueda */}
      {isSearching && (
        <p className="text-sm text-muted-foreground text-center">
          Buscando...
        </p>
      )}

      {/* Resultados de búsqueda */}
      {!isSearching && searchResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {searchResults.length} usuario(s) encontrado(s)
          </p>
          {searchResults.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {user.full_name || "Usuario sin nombre"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Miembro desde{" "}
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddShared(user)}
                    disabled={addingUserId === user.id}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {addingUserId === user.id ? "Enviando..." : "Añadir"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sin resultados */}
      {!isSearching &&
        searchQuery.trim().length >= 2 &&
        searchResults.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                No se encontraron usuarios con "{searchQuery}"
              </p>
            </CardContent>
          </Card>
        )}

      {/* Mensaje inicial */}
      {!isSearching && searchQuery.trim().length < 2 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Escribe al menos 2 caracteres para buscar usuarios
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
