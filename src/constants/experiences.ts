import type { Experience } from "@/types/experience";
import experience1 from "@/assets/experience-1.jpg";
import experience2 from "@/assets/experience-2.jpg";
import experience3 from "@/assets/experience-3.jpg";
import experience4 from "@/assets/experience-4.jpg";

/**
 * Mock experiences data
 * TODO: Replace with real data from Supabase
 */
export const mockExperiences: Experience[] = [
  {
    id: 1,
    image: experience1,
    title: "Amanecer en la montaña",
    author: "María González",
    date: "Hace 2 días",
    excerpt: "Después de caminar durante horas en la oscuridad, finalmente llegué a la cima justo cuando el sol comenzaba a aparecer. Ese momento de silencio y belleza natural me recordó por qué amo estas aventuras.",
    reactions: 24,
    comments: 8,
  },
  {
    id: 2,
    image: experience2,
    title: "Cocinando con recetas de la abuela",
    author: "Carlos Ruiz",
    date: "Hace 5 días",
    excerpt: "Hoy preparé el guiso secreto de mi abuela. El aroma que llenó la cocina me transportó a mi infancia. A veces las mejores experiencias son las más simples.",
    reactions: 32,
    comments: 12,
  },
  {
    id: 3,
    image: experience3,
    title: "Un libro y un café",
    author: "Ana Martínez",
    date: "Hace 1 semana",
    excerpt: "Encontré este pequeño café escondido en el centro. Pasé la tarde leyendo mientras el mundo pasaba por la ventana. Momentos como estos son los que realmente importan.",
    reactions: 18,
    comments: 5,
  },
  {
    id: 4,
    image: experience4,
    title: "Atardecer con amigos",
    author: "Luis Fernández",
    date: "Hace 1 semana",
    excerpt: "Una tarde perfecta en la playa con mis mejores amigos. Sin preocupaciones, solo risas y buenos momentos. Esto es vivir de verdad.",
    reactions: 45,
    comments: 15,
  },
];
