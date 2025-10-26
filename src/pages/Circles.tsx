import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CircleService } from "@/services/circle.service";
import { ROUTES } from "@/routes";
import { Navbar } from "@/components/Navbar";
import { CircleModal } from "@/components/CircleModal";
import { CircleMembersModal } from "@/components/CircleMembersModal";
import { Loader2, Plus, Users, Edit, Trash2, CircleDot } from "lucide-react";
import type { CircleWithMemberCount, Circle } from "@/types/circle";

const Circles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [circles, setCircles] = useState<CircleWithMemberCount[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
      return;
    }
    loadCircles();
  }, [user, navigate]);

  const loadCircles = async () => {
    setIsLoading(true);
    try {
      const data = await CircleService.getMyCircles();
      setCircles(data);
    } catch (error: any) {
      toast({
        title: "Error al cargar círculos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedCircle(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (circle: CircleWithMemberCount) => {
    setSelectedCircle(circle);
    setIsCreateModalOpen(true);
  };

  const handleManageMembers = (circle: CircleWithMemberCount) => {
    setSelectedCircle(circle);
    setIsMembersModalOpen(true);
  };

  const handleDelete = async (circle: CircleWithMemberCount) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el círculo "${circle.name}"?`)) {
      return;
    }

    try {
      await CircleService.deleteCircle(circle.id);

      toast({
        title: "Círculo eliminado",
        description: "El círculo ha sido eliminado exitosamente",
      });

      loadCircles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el círculo",
        variant: "destructive",
      });
    }
  };

  const handleModalSuccess = () => {
    loadCircles();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mis Círculos</h1>
            <p className="text-muted-foreground">
              Gestiona tus grupos de personas para compartir historias
            </p>
          </div>
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo círculo
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : circles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <CircleDot className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No tienes círculos aún</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Los círculos te permiten organizar a tus compartidos en grupos y compartir
                historias privadas con grupos específicos de personas.
              </p>
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Crear mi primer círculo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {circles.map((circle) => (
              <Card key={circle.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: circle.color }}
                      />
                      <CardTitle className="truncate">{circle.name}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {circle.description || "Sin descripción"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Member Count */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {circle.member_count}{" "}
                        {circle.member_count === 1 ? "miembro" : "miembros"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageMembers(circle)}
                        className="flex-1 gap-2"
                      >
                        <Users className="h-4 w-4" />
                        Miembros
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(circle)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(circle)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">¿Qué son los círculos?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              🔵 Los círculos te permiten organizar a tus compartidos en grupos temáticos
            </p>
            <p>
              📝 Al crear una historia privada, puedes compartirla con un círculo específico
            </p>
            <p>
              👥 Solo los miembros del círculo podrán ver las historias compartidas con él
            </p>
            <p>
              ✨ Ejemplos: "Familia", "Amigos cercanos", "Compañeros de trabajo", etc.
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Modals */}
      <CircleModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedCircle(null);
        }}
        onSuccess={handleModalSuccess}
        circle={selectedCircle}
      />

      <CircleMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => {
          setIsMembersModalOpen(false);
          setSelectedCircle(null);
        }}
        circle={selectedCircle}
      />
    </div>
  );
};

export default Circles;
