import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/sections";
import { Mail, MessageCircle, Heart, HelpCircle, Bug, Lightbulb } from "lucide-react";

/**
 * Contact Page
 * Contact information and support
 */
const Contact = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-4xl px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Contacto
          </h1>
          <p className="text-lg text-muted-foreground">
            Estamos aquí para ayudarte. No dudes en ponerte en contacto con nosotros
          </p>
        </div>

        <div className="space-y-8">
          {/* Email principal */}
          <section className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 rounded-lg p-8 text-center">
            <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-3">Email de contacto</h2>
            <p className="text-muted-foreground mb-4">
              Para cualquier consulta, sugerencia o problema, escríbenos a:
            </p>
            <a
              href="mailto:gomezmon@hotmail.com"
              className="inline-flex items-center gap-2 text-2xl font-semibold text-primary hover:underline"
            >
              <Mail className="h-6 w-6" />
              gomezmon@hotmail.com
            </a>
            <p className="text-sm text-muted-foreground mt-4">
              Respondemos en un plazo de 24-48 horas
            </p>
          </section>

          {/* Razones de contacto */}
          <section className="bg-card border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 text-center">¿En qué podemos ayudarte?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                <HelpCircle className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Soporte técnico</h3>
                  <p className="text-sm text-muted-foreground">
                    ¿Tienes problemas con tu cuenta, no puedes iniciar sesión, o algo no
                    funciona correctamente? Contáctanos y te ayudaremos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                <Lightbulb className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Sugerencias</h3>
                  <p className="text-sm text-muted-foreground">
                    ¿Tienes ideas para mejorar la plataforma? Nos encantaría escucharlas.
                    Tu feedback es valioso para nosotros.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                <Bug className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Reportar errores</h3>
                  <p className="text-sm text-muted-foreground">
                    ¿Encontraste un bug o comportamiento inesperado? Repórtalo para que
                    podamos solucionarlo rápidamente.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                <MessageCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Consultas generales</h3>
                  <p className="text-sm text-muted-foreground">
                    ¿Tienes preguntas sobre cómo funciona la plataforma, privacidad, o
                    cualquier otra duda? Estamos para ayudarte.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Preguntas frecuentes */}
          <section className="bg-card border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Preguntas Frecuentes</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">¿Cómo puedo recuperar mi contraseña?</h3>
                <p className="text-sm text-muted-foreground">
                  En la página de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?" y
                  sigue las instrucciones. Recibirás un email para restablecer tu contraseña.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">¿Puedo eliminar mi cuenta?</h3>
                <p className="text-sm text-muted-foreground">
                  Sí, contáctanos por email y eliminaremos tu cuenta y todos tus datos de forma
                  permanente. Este proceso es irreversible.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">¿Cómo reporto contenido inapropiado?</h3>
                <p className="text-sm text-muted-foreground">
                  Envíanos un email con el enlace a la historia o comentario en cuestión, y
                  tomaremos las medidas apropiadas.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">¿Tienen aplicación móvil?</h3>
                <p className="text-sm text-muted-foreground">
                  Actualmente no, pero la plataforma web está optimizada para dispositivos
                  móviles. Puedes acceder desde cualquier navegador en tu teléfono.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">¿La plataforma tiene algún costo?</h3>
                <p className="text-sm text-muted-foreground">
                  Actualmente Momentos Auténticos es completamente gratuito. Nuestro objetivo
                  es mantenerlo así, sin publicidad ni modelos premium.
                </p>
              </div>
            </div>
          </section>

          {/* Compromiso */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Heart className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold mb-3">Nuestro compromiso</h2>
                <p className="text-muted-foreground">
                  Momentos Auténticos es un proyecto hecho con dedicación para crear un espacio
                  digital más humano y auténtico. Valoramos cada mensaje que recibimos y nos
                  esforzamos por responder de manera personalizada y oportuna.
                </p>
                <p className="text-muted-foreground mt-3">
                  Tu feedback, preguntas y sugerencias son fundamentales para mejorar la plataforma
                  y asegurar que cumple con las necesidades de nuestra comunidad.
                </p>
              </div>
            </div>
          </section>

          {/* Call to action */}
          <section className="text-center p-8 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-3">¿Listo para contactarnos?</h2>
            <p className="text-muted-foreground mb-6">
              No dudes en escribirnos. Estamos aquí para ayudarte
            </p>
            <a
              href="mailto:gomezmon@hotmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              <Mail className="h-5 w-5" />
              Enviar email
            </a>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
