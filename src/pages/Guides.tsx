import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/sections";
import { Book, Heart, Lock, Users, FileText, Share2, CircleDot, MessageCircle } from "lucide-react";

/**
 * Guides Page
 * Documentation and help guides for using the platform
 */
const Guides = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-4xl px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Guías de uso
          </h1>
          <p className="text-lg text-muted-foreground">
            Aprende a sacar el máximo provecho de Momentos Auténticos
          </p>
        </div>

        <div className="space-y-8">
          {/* Como empezar */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Book className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Cómo empezar</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>1. Crea tu cuenta con un email válido</p>
                  <p>2. Completa tu perfil con tu nombre y foto</p>
                  <p>3. Explora las historias públicas en la sección "Explorar"</p>
                  <p>4. Conecta con otros usuarios enviando solicitudes de compartidos</p>
                  <p>5. Comienza a escribir tus propias experiencias</p>
                </div>
              </div>
            </div>
          </section>

          {/* Escribir historias */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <FileText className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Escribir historias</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    <strong>Título:</strong> Elige un título descriptivo que resuma tu experiencia
                  </p>
                  <p>
                    <strong>Contenido:</strong> Escribe tu historia con autenticidad. No hay límite de extensión
                  </p>
                  <p>
                    <strong>Extracto:</strong> Un breve resumen de 2-3 líneas para mostrar en las vistas previas
                  </p>
                  <p>
                    <strong>Imagen:</strong> Añade una foto relacionada (máximo 5MB)
                  </p>
                  <p>
                    <strong>Etiquetas:</strong> Categoriza tu historia con etiquetas temáticas
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Privacidad */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Lock className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Control de privacidad</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    <strong>Historias públicas:</strong> Visibles para todos los usuarios
                  </p>
                  <p>
                    <strong>Historias privadas:</strong> Solo visibles para ti y tus compartidos seleccionados
                  </p>
                  <p className="mt-3">
                    <strong>Compartir con todos mis compartidos:</strong> Tus compartidos aceptados verán la historia
                  </p>
                  <p>
                    <strong>Compartir con un círculo:</strong> Solo los miembros de un círculo específico verán la historia
                  </p>
                  <p>
                    <strong>Compartir con específicos:</strong> Selecciona uno o varios compartidos concretos
                  </p>
                  <p className="mt-4 text-sm">
                    Puedes cambiar la configuración de privacidad en cualquier momento editando la historia
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Compartidos */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Users className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Sistema de compartidos</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    Los compartidos son conexiones bidireccionales con otros usuarios que te permiten ver sus historias privadas
                  </p>
                  <p className="mt-3">
                    <strong>Enviar solicitud:</strong> Desde el perfil de cualquier usuario
                  </p>
                  <p>
                    <strong>Aceptar solicitud:</strong> En tu perfil verás las solicitudes pendientes
                  </p>
                  <p>
                    <strong>Gestionar compartidos:</strong> Puedes eliminar conexiones en cualquier momento
                  </p>
                  <p className="mt-4 text-sm">
                    Solo los compartidos con estado "Aceptado" pueden ver tus historias privadas
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Círculos */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <CircleDot className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Círculos - Grupos de compartidos</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    Los círculos te permiten organizar a tus compartidos en grupos temáticos para compartir historias de forma más específica
                  </p>
                  <p className="mt-3">
                    <strong>¿Qué son los círculos?</strong>
                  </p>
                  <p>
                    Son grupos personalizables donde puedes añadir a tus compartidos. Por ejemplo: "Familia", "Amigos cercanos", "Compañeros de trabajo", etc.
                  </p>
                  <p className="mt-3">
                    <strong>Crear un círculo:</strong> Accede a la sección "Círculos" desde el menú de navegación
                  </p>
                  <p>
                    <strong>Añadir miembros:</strong> Solo puedes añadir usuarios con los que ya tienes conexión de compartidos aceptada
                  </p>
                  <p>
                    <strong>Personalización:</strong> Cada círculo tiene nombre, descripción opcional y color identificador
                  </p>
                  <p>
                    <strong>Compartir con círculos:</strong> Al crear/editar una historia privada, elige la opción "Compartir con un círculo"
                  </p>
                  <p className="mt-4 text-sm">
                    Los círculos te dan un control granular sobre quién ve cada historia, sin necesidad de seleccionar personas individualmente
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Chat/Mensajes */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <MessageCircle className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Sistema de mensajería</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    Comunícate de forma privada con tus compartidos a través del chat en tiempo real
                  </p>
                  <p className="mt-3">
                    <strong>Iniciar conversación:</strong> Desde la página de Compartidos, haz clic en el botón "Mensaje"
                  </p>
                  <p>
                    <strong>Ver mensajes:</strong> Accede a "Mensajes" desde el menú para ver todas tus conversaciones
                  </p>
                  <p>
                    <strong>Tiempo real:</strong> Los mensajes llegan instantáneamente sin necesidad de recargar
                  </p>
                  <p>
                    <strong>Mensajes no leídos:</strong> Se muestran con un contador para que no pierdas ninguna conversación
                  </p>
                  <p className="mt-4 text-sm">
                    Solo puedes chatear con usuarios con los que tengas una conexión de compartidos aceptada
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Interacciones */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Heart className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Interacciones</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    <strong>Reacciones:</strong> Da corazón a las historias que te conmuevan
                  </p>
                  <p>
                    <strong>Comentarios:</strong> Comparte tus pensamientos y experiencias relacionadas
                  </p>
                  <p>
                    <strong>Favoritos:</strong> Guarda historias para releerlas después en tu sección de favoritos
                  </p>
                  <p className="mt-4 text-sm">
                    Todas las interacciones son respetuosas y constructivas. Mantenemos un espacio seguro
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Etiquetas */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Share2 className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Uso de etiquetas</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    Las etiquetas ayudan a categorizar y descubrir historias relacionadas
                  </p>
                  <p className="mt-3">
                    <strong>Seleccionar existentes:</strong> Usa etiquetas ya creadas por la comunidad
                  </p>
                  <p>
                    <strong>Crear nuevas:</strong> Si no encuentras una etiqueta adecuada, créala
                  </p>
                  <p>
                    <strong>Búsqueda:</strong> Filtra historias por etiquetas en la página Explorar
                  </p>
                  <p className="mt-4 text-sm">
                    Usa etiquetas descriptivas y relevantes para ayudar a otros a encontrar tu historia
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Guides;
