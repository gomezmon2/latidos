import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ImagePlus, Send, X, Upload, Lock, Globe, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ExperienceService } from "@/services/experience.service";
import { StorageService } from "@/services/storage.service";
import { TagService } from "@/services/tag.service";
import { ROUTES } from "@/routes";
import { Navbar } from "@/components/Navbar";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { TagSelector } from "@/components/TagSelector";
import { SharedSelector } from "@/components/SharedSelector";

/**
 * Edit Experience Page
 * Form to edit an existing story/experience
 */
const EditExperience = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [originalImagePath, setOriginalImagePath] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true); // ✨ privacidad
  const [shareMode, setShareMode] = useState<"all" | "specific" | "circle">("all");
  const [selectedSharedWith, setSelectedSharedWith] = useState<string[]>([]);
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    image_url: "",
  });

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
      return;
    }
    if (!id) {
      navigate(ROUTES.HOME);
      return;
    }
    loadExperience();
  }, [user, id]);

  const loadExperience = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const experience = await ExperienceService.getExperienceById(id);
      if (!experience) {
        toast({
          title: "Historia no encontrada",
          variant: "destructive",
        });
        navigate(ROUTES.EXPLORE);
        return;
      }

      // Verify ownership
      if (experience.user_id !== user?.id) {
        toast({
          title: "No autorizado",
          description: "No puedes editar historias de otros usuarios",
          variant: "destructive",
        });
        navigate(ROUTES.EXPLORE);
        return;
      }

      setFormData({
        title: experience.title,
        content: experience.content,
        excerpt: experience.excerpt || "",
        image_url: experience.image_url || "",
      });

      // ✨ Setear privacidad
      setIsPublic(experience.is_public ?? true); // default true si no existe

      // ✨ Setear modo de compartir
      if (experience.shared_circle_id) {
        setShareMode("circle");
        setSelectedCircleId(experience.shared_circle_id);
      } else if (experience.shared_with && experience.shared_with.length > 0) {
        setShareMode("specific");
        setSelectedSharedWith(experience.shared_with);
      } else {
        setShareMode("all");
        setSelectedSharedWith([]);
      }

      // Store original image path for deletion if replaced
      if (experience.image_url) {
        const path = StorageService.getPathFromUrl(experience.image_url);
        setOriginalImagePath(path);
      }

      // Load existing tags
      try {
        const tags = await TagService.getTagsForExperience(id);
        setSelectedTagIds(tags.map(tag => tag.id));
      } catch (error) {
        console.error("Error loading tags:", error);
      }
    } catch (error: any) {
      toast({
        title: "Error al cargar",
        description: error.message,
        variant: "destructive",
      });
      navigate(ROUTES.EXPLORE);
    } finally {
      setIsLoading(false);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = StorageService.validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "⚠️ Archivo no válido",
        description: validation.error,
        variant: "destructive",
      });
      // Clear the input so the user can try again
      e.target.value = '';
      return;
    }

    // Set selected file and create preview
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData((prev) => ({ ...prev, image_url: "" }));
    setOriginalImagePath(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "El título es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (!formData.content.trim()) {
      toast({
        title: "Error",
        description: "El contenido es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (selectedTagIds.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos una etiqueta",
        variant: "destructive",
      });
      return;
    }

    if (!id || !user) return;

    setIsSubmitting(true);

    try {
      let imageUrl = formData.image_url.trim();

      // Upload new image if file selected
      if (selectedFile) {
        setIsUploadingImage(true);
        try {
          const uploadResult = await StorageService.replaceImage(
            originalImagePath,
            selectedFile,
            user.id
          );
          imageUrl = uploadResult.url;
          setOriginalImagePath(uploadResult.path);
        } catch (uploadError: any) {
          toast({
            title: "Error al subir imagen",
            description: uploadError.message,
            variant: "destructive",
          });
          setIsSubmitting(false);
          setIsUploadingImage(false);
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      // Determine shared_with and shared_circle_id based on privacy and share mode
      let sharedWith: string[] | null = null;
      let sharedCircleId: string | null = null;

      if (!isPublic) {
        // Private story
        if (shareMode === "circle") {
          // Shared with a specific circle
          sharedCircleId = selectedCircleId;
        } else if (shareMode === "specific") {
          // Shared with specific users
          sharedWith = selectedSharedWith;
        }
        // If shareMode === "all", both stay null (share with all connections)
      }

      await ExperienceService.updateExperience(id, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || undefined,
        image_url: imageUrl || undefined,
        is_public: isPublic,
        shared_with: sharedWith,
        shared_circle_id: sharedCircleId,
        tag_ids: selectedTagIds,
      });

      // Update tags
      await TagService.updateTagsForExperience(id, selectedTagIds);

      toast({
        title: "¡Historia actualizada!",
        description: "Los cambios han sido guardados exitosamente",
      });

      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Force reload to show updated image (cache busting)
      navigate(`${ROUTES.EXPERIENCE}/${id}`, { replace: true });
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error al actualizar",
        description: error.message || "No se pudo actualizar tu historia",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("¿Estás seguro de que quieres salir sin guardar los cambios?")) {
      navigate(`${ROUTES.EXPERIENCE}/${id}`);
    }
  };

  if (!user || isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`${ROUTES.EXPERIENCE}/${id}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar historia</h1>
            <p className="text-muted-foreground">
              Modifica tu experiencia compartida
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Editar Historia</CardTitle>
            <CardDescription>
              Actualiza los campos que desees modificar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Título <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Un título llamativo para tu historia"
                  maxLength={200}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/200 caracteres
                </p>
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">Extracto (opcional)</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Un breve resumen de tu historia"
                  rows={2}
                  maxLength={300}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.excerpt.length}/300 caracteres
                </p>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">
                  Contenido <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Tu historia completa..."
                  rows={12}
                  className="resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {formData.content.length} caracteres
                </p>
              </div>

              {/* Tags */}
              <TagSelector
                selectedTagIds={selectedTagIds}
                onChange={setSelectedTagIds}
                maxTags={5}
                required={true}
                label="Etiquetas"
              />

              {/* Privacy Selector - ✨ NUEVO */}
              <div className="space-y-3">
                <Label>Privacidad</Label>
                <RadioGroup
                  value={isPublic ? "public" : "private"}
                  onValueChange={(value) => setIsPublic(value === "public")}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-3 space-y-0">
                    <RadioGroupItem value="public" id="public" />
                    <div className="flex-1">
                      <Label
                        htmlFor="public"
                        className="font-normal cursor-pointer flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Pública</span>
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Todos pueden ver esta historia en Explorar
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 space-y-0">
                    <RadioGroupItem value="private" id="private" />
                    <div className="flex-1">
                      <Label
                        htmlFor="private"
                        className="font-normal cursor-pointer flex items-center gap-2"
                      >
                        <Lock className="h-4 w-4 text-amber-600" />
                        <span className="font-medium">Privada</span>
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Solo tú y tus compartidos seleccionados pueden verla
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Shared Selector - Shown only for private stories */}
              {!isPublic && (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                  <Label className="text-base font-semibold">¿Con quién compartir?</Label>
                  <SharedSelector
                    selectedUserIds={selectedSharedWith}
                    onChange={setSelectedSharedWith}
                    shareMode={shareMode}
                    onShareModeChange={setShareMode}
                    selectedCircleId={selectedCircleId}
                    onCircleChange={setSelectedCircleId}
                  />
                </div>
              )}

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Imagen (opcional)</Label>
                <p className="text-xs text-muted-foreground">
                  ⚠️ Tamaño máximo: 5MB. Formatos: JPG, PNG, WebP, GIF
                </p>

                {!previewUrl && !formData.image_url && (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <Upload className="h-10 w-10 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Sube una imagen</p>
                        <p className="text-sm text-muted-foreground">
                          Haz clic para seleccionar un archivo
                        </p>
                      </div>
                      <div className="mt-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-xs font-medium text-amber-800">
                          ⚠️ Límite: 5MB máximo
                        </p>
                      </div>
                      <Button type="button" variant="outline" size="sm">
                        Seleccionar archivo
                      </Button>
                    </label>
                  </div>
                )}

                {(previewUrl || formData.image_url) && (
                  <div className="space-y-2">
                    <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border">
                      <ImageWithFallback
                        src={previewUrl || formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        fallbackMessage="No se pudo cargar la imagen."
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground">
                        {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                    {!selectedFile && formData.image_url && (
                      <div className="flex gap-2">
                        <input
                          type="file"
                          id="image-replace"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <label htmlFor="image-replace">
                          <Button type="button" variant="outline" size="sm" asChild>
                            <span>Cambiar imagen</span>
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || isUploadingImage} className="gap-2">
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Subiendo imagen...
                    </>
                  ) : isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Guardar cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EditExperience;
