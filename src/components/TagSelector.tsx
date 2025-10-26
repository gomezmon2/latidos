import { useState, useEffect } from "react";
import { TagBadge } from "@/components/TagBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TagService } from "@/services/tag.service";
import type { Tag } from "@/types/experience";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";

interface TagSelectorProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  maxTags?: number;
  required?: boolean;
  label?: string;
}

export const TagSelector = ({
  selectedTagIds,
  onChange,
  maxTags = 5,
  required = false,
  label = "Etiquetas"
}: TagSelectorProps) => {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const { toast } = useToast();

  // Load all available tags
  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const tags = await TagService.getAllTags();
      setAllTags(tags);
    } catch (error) {
      console.error("Error loading tags:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las etiquetas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTag = (tagId: string) => {
    const isSelected = selectedTagIds.includes(tagId);

    if (isSelected) {
      // Remove tag
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      // Add tag (if limit not reached)
      if (selectedTagIds.length >= maxTags) {
        toast({
          title: "Límite alcanzado",
          description: `Solo puedes seleccionar hasta ${maxTags} etiquetas`,
          variant: "destructive"
        });
        return;
      }
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = async () => {
    console.log("🔵 [TagSelector] handleCreateTag llamado");
    const trimmedName = newTagName.trim();
    console.log("🔵 [TagSelector] Nombre trimmed:", trimmedName);

    if (!trimmedName) {
      console.log("❌ [TagSelector] Nombre vacío");
      toast({
        title: "Error",
        description: "El nombre de la etiqueta no puede estar vacío",
        variant: "destructive"
      });
      return;
    }

    if (trimmedName.length < 2) {
      toast({
        title: "Error",
        description: "El nombre debe tener al menos 2 caracteres",
        variant: "destructive"
      });
      return;
    }

    if (trimmedName.length > 30) {
      toast({
        title: "Error",
        description: "El nombre no puede tener más de 30 caracteres",
        variant: "destructive"
      });
      return;
    }

    setCreatingTag(true);
    console.log("⏳ [TagSelector] Iniciando creación...");

    try {
      console.log("🔵 [TagSelector] Llamando a TagService.createTag");
      const newTag = await TagService.createTag(trimmedName);
      console.log("✅ [TagSelector] Etiqueta creada:", newTag);

      // Agregar la nueva etiqueta a la lista
      setAllTags(prev => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
      console.log("✅ [TagSelector] Etiqueta agregada a la lista");

      // Seleccionar automáticamente la nueva etiqueta
      if (selectedTagIds.length < maxTags) {
        onChange([...selectedTagIds, newTag.id]);
        console.log("✅ [TagSelector] Etiqueta seleccionada automáticamente");
      }

      setNewTagName("");
      console.log("✅ [TagSelector] Campo limpiado");

      toast({
        title: "¡Etiqueta creada!",
        description: `La etiqueta "${newTag.name}" ha sido creada y agregada`,
      });
      console.log("✅ [TagSelector] Toast mostrado");
    } catch (error: any) {
      console.error("❌ [TagSelector] Error al crear etiqueta:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la etiqueta",
        variant: "destructive"
      });
    } finally {
      setCreatingTag(false);
      console.log("✅ [TagSelector] Proceso finalizado");
    }
  };

  const selectedTags = allTags.filter(tag => selectedTagIds.includes(tag.id));
  const availableTags = allTags.filter(tag => !selectedTagIds.includes(tag.id));

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          Cargando etiquetas...
        </div>
      </div>
    );
  }

  if (allTags.length === 0) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="text-sm text-destructive">
          No se pudieron cargar las etiquetas. Por favor recarga la página.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <span className="text-xs text-muted-foreground">
          {selectedTagIds.length}/{maxTags} seleccionadas
        </span>
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg border border-border">
          {selectedTags.map(tag => (
            <TagBadge
              key={tag.id}
              tag={tag}
              onRemove={() => handleToggleTag(tag.id)}
              variant="default"
            />
          ))}
        </div>
      )}

      {/* Create New Tag Form */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">
          Crear nueva etiqueta:
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateTag();
              }
            }}
            placeholder="Nombre de la etiqueta..."
            maxLength={30}
            disabled={creatingTag}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleCreateTag}
            disabled={creatingTag || !newTagName.trim()}
            size="sm"
            className="gap-1"
          >
            {creatingTag ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Crear
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Available Tags */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">
          {selectedTagIds.length < maxTags
            ? "O selecciona etiquetas existentes:"
            : "Límite alcanzado. Elimina alguna para agregar otra."}
        </div>
        <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-2 border border-border rounded-lg">
          {availableTags.map(tag => (
            <Button
              key={tag.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleToggleTag(tag.id)}
              disabled={selectedTagIds.length >= maxTags}
              className="h-auto py-1.5 px-3 hover:bg-primary/10 hover:border-primary transition-colors"
            >
              {tag.emoji && <span className="mr-1.5">{tag.emoji}</span>}
              {tag.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Validation message */}
      {required && selectedTagIds.length === 0 && (
        <p className="text-sm text-destructive">
          Debes seleccionar al menos una etiqueta
        </p>
      )}
    </div>
  );
};
