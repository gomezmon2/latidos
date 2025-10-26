import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CircleService } from "@/services/circle.service";
import { Loader2, CircleDot } from "lucide-react";
import type { CircleWithMemberCount } from "@/types/circle";

interface CircleSelectorProps {
  selectedCircleId: string | null;
  onChange: (circleId: string | null) => void;
}

export const CircleSelector = ({
  selectedCircleId,
  onChange,
}: CircleSelectorProps) => {
  const [circles, setCircles] = useState<CircleWithMemberCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCircles();
  }, []);

  const loadCircles = async () => {
    try {
      setIsLoading(true);
      const data = await CircleService.getMyCircles();
      setCircles(data);
    } catch (error) {
      console.error("Error loading circles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (circles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/30">
        <CircleDot className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm font-medium">No tienes círculos creados</p>
        <p className="text-xs mt-1">
          Crea círculos para compartir historias con grupos específicos
        </p>
        {/* TODO: Add button to create circles */}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm text-muted-foreground">
        Selecciona un círculo
      </Label>
      <ScrollArea className="max-h-[300px] rounded-md border p-4">
        <RadioGroup
          value={selectedCircleId || ""}
          onValueChange={(value) => onChange(value || null)}
          className="space-y-3"
        >
          {circles.map((circle) => (
            <div
              key={circle.id}
              className="flex items-start space-x-3 space-y-0 p-3 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <RadioGroupItem value={circle.id} id={`circle-${circle.id}`} />
              <div className="flex-1">
                <Label
                  htmlFor={`circle-${circle.id}`}
                  className="font-normal cursor-pointer flex items-center gap-2"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: circle.color }}
                  />
                  <span className="font-medium">{circle.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({circle.member_count} {circle.member_count === 1 ? 'miembro' : 'miembros'})
                  </span>
                </Label>
                {circle.description && (
                  <p className="text-sm text-muted-foreground mt-1 ml-5">
                    {circle.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </RadioGroup>
      </ScrollArea>
    </div>
  );
};
