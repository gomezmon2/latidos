import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CircleService } from "@/services/circle.service";
import { Loader2 } from "lucide-react";
import type { Circle } from "@/types/circle";

interface CircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  circle?: Circle | null; // If provided, we're editing; otherwise creating
}

const PRESET_COLORS = [
  "#8B5CF6", // Purple
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#14B8A6", // Teal
];

export const CircleModal = ({ isOpen, onClose, onSuccess, circle }: CircleModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#8B5CF6",
  });

  // Load circle data when editing
  useEffect(() => {
    if (circle) {
      setFormData({
        name: circle.name,
        description: circle.description || "",
        color: circle.color,
      });
    } else {
      // Reset form when creating new
      setFormData({
        name: "",
        description: "",
        color: "#8B5CF6",
      });
    }
  }, [circle, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del círculo es obligatorio",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (circle) {
        // Update existing circle
        await CircleService.updateCircle(circle.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          color: formData.color,
        });

        toast({
          title: "Círculo actualizado",
          description: "Los cambios han sido guardados",
        });
      } else {
        // Create new circle
        await CircleService.createCircle({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          color: formData.color,
        });

        toast({
          title: "Círculo creado",
          description: "El nuevo círculo ha sido creado exitosamente",
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el círculo",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {circle ? "Editar círculo" : "Crear nuevo círculo"}
          </DialogTitle>
          <DialogDescription>
            {circle
              ? "Modifica los detalles de tu círculo"
              : "Crea un grupo de personas para compartir historias"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre del círculo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Familia, Amigos cercanos, Compañeros de trabajo..."
              maxLength={100}
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {formData.name.length}/100 caracteres
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Una breve descripción del círculo..."
              rows={3}
              className="resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label>Color identificador</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    formData.color === color
                      ? "border-foreground scale-110"
                      : "border-border hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={isSubmitting}
                  title={color}
                />
              ))}
              <input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, color: e.target.value }))
                }
                className="w-10 h-10 rounded-full border-2 border-border cursor-pointer"
                disabled={isSubmitting}
                title="Elegir color personalizado"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Selecciona un color o usa el selector personalizado
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : circle ? (
                "Guardar cambios"
              ) : (
                "Crear círculo"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
