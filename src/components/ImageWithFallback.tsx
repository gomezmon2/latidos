import { useState, useEffect } from "react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackMessage?: string;
}

/**
 * Image component with fallback handling
 * Shows error message if image fails to load
 */
export const ImageWithFallback = ({
  src,
  alt,
  className = "",
  fallbackMessage = "No se pudo cargar la imagen",
}: ImageWithFallbackProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset states when src changes
  useEffect(() => {
    if (!src) {
      setHasError(false);
      setIsLoading(false);
      return;
    }

    setHasError(false);
    setIsLoading(true);
  }, [src]);

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground p-4 text-center">
        <div>
          <p className="text-sm">❌ {fallbackMessage}</p>
          <p className="text-xs mt-2">URL: {src.substring(0, 50)}...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <p className="text-sm text-muted-foreground">Cargando imagen...</p>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? "hidden" : ""}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </>
  );
};
