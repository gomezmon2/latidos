import { Sparkles } from "lucide-react";
import { platformFeatures } from "@/constants";

/**
 * Features Section Component
 * Displays the main platform features/value propositions
 */
export const FeaturesSection = () => {
  return (
    <section className="py-20 px-6 bg-gradient-subtle">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Experiencias auténticas</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Un espacio diferente para compartir
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sin algoritmos que decidan qué ver. Sin métricas de vanidad. Solo
            historias reales de personas reales.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {platformFeatures.map((feature, index) => (
            <div key={index} className="text-center p-6">
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full ${feature.bgColor} flex items-center justify-center`}
              >
                <span className="text-3xl">{feature.icon}</span>
              </div>
              <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
