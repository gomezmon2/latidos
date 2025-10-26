import { useState, useEffect } from "react";
import { TagBadge } from "@/components/TagBadge";
import { Button } from "@/components/ui/button";
import { TagService } from "@/services/tag.service";
import type { Tag } from "@/types/experience";
import { X } from "lucide-react";

interface TagFilterBarProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

export const TagFilterBar = ({ selectedTagIds, onChange }: TagFilterBarProps) => {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

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
      // Add tag
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const selectedTags = allTags.filter(tag => selectedTagIds.includes(tag.id));
  const displayTags = showAll ? allTags : allTags.slice(0, 12);

  if (loading) {
    return (
      <div className="w-full py-4 px-6 bg-card border-b border-border">
        <div className="text-sm text-muted-foreground">Cargando etiquetas...</div>
      </div>
    );
  }

  return (
    <div className="w-full py-4 px-6 bg-card border-b border-border">
      <div className="container mx-auto max-w-7xl">
        {/* Header with selected tags */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-2">Filtrar por categorías</h3>
            {selectedTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  Filtrando por:
                </span>
                {selectedTags.map(tag => (
                  <TagBadge
                    key={tag.id}
                    tag={tag}
                    onRemove={() => handleToggleTag(tag.id)}
                    variant="default"
                    size="sm"
                  />
                ))}
              </div>
            )}
          </div>
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-7 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          )}
        </div>

        {/* Tags in vertical columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {(showAll ? allTags : allTags.slice(0, 12)).map(tag => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <Button
                key={tag.id}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleToggleTag(tag.id)}
                className="h-9 px-3 justify-start transition-all"
              >
                {tag.emoji && <span className="mr-2">{tag.emoji}</span>}
                <span className="truncate">{tag.name}</span>
              </Button>
            );
          })}
        </div>

        {/* Show more/less button */}
        {allTags.length > 12 && (
          <div className="mt-3 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="h-8 px-4 text-xs"
            >
              {showAll ? "Ver menos" : `Ver todas (${allTags.length - 12} más)`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
