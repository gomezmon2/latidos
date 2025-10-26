import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/sections";
import { Shield, Lock, Eye, Database, UserCheck, FileText } from "lucide-react";

/**
 * Privacy Page
 * Privacy policy and data protection information
 */
const Privacy = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-4xl px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Política de Privacidad
          </h1>
          <p className="text-lg text-muted-foreground">
            Tu privacidad es nuestra prioridad. Última actualización: Enero 2025
          </p>
        </div>

        <div className="space-y-8">
          {/* Introduccion */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Introducción</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    En Momentos Auténticos, entendemos que tus historias y experiencias son
                    profundamente personales. Por eso, nos comprometemos a proteger tu privacidad
                    y darte control total sobre tus datos.
                  </p>
                  <p>
                    Esta política explica qué información recopilamos, cómo la usamos, y tus
                    derechos sobre tus datos personales.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Informacion que recopilamos */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Database className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Información que Recopilamos</h2>
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Información de cuenta</h3>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Dirección de correo electrónico (requerido para autenticación)</li>
                      <li>Nombre completo (opcional, para personalizar tu perfil)</li>
                      <li>Foto de perfil (opcional)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Contenido que creas</h3>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Historias y experiencias que escribes</li>
                      <li>Imágenes que subes con tus historias</li>
                      <li>Comentarios y reacciones</li>
                      <li>Etiquetas que creas</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Datos de uso</h3>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Fecha y hora de acceso a la plataforma</li>
                      <li>Páginas visitadas</li>
                      <li>Información técnica básica (navegador, dispositivo)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Como usamos tu informacion */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Cómo Usamos tu Información</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Proporcionar y mantener el servicio de la plataforma</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Autenticar tu identidad cuando inicias sesión</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Mostrar tu contenido a los usuarios que elijas (público o compartidos)</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Enviar notificaciones importantes sobre tu cuenta</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Mejorar la plataforma y corregir problemas técnicos</span>
                  </p>

                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                    <p className="font-semibold text-foreground mb-2">Lo que NUNCA haremos:</p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">×</span>
                      <span>Vender tus datos a terceros</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">×</span>
                      <span>Usar tus historias para entrenar IA o análisis de datos</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">×</span>
                      <span>Mostrar publicidad basada en tus historias personales</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">×</span>
                      <span>Compartir tus datos sin tu consentimiento explícito</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Control de privacidad */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Lock className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Tu Control de Privacidad</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    <strong>Historias públicas:</strong> Visibles para todos los usuarios registrados.
                    Tú decides cuándo hacer una historia pública.
                  </p>
                  <p>
                    <strong>Historias privadas:</strong> Solo tú y tus compartidos aceptados pueden verlas.
                    Puedes elegir compartir con todos tus compartidos o seleccionar usuarios específicos.
                  </p>
                  <p>
                    <strong>Edición y eliminación:</strong> Puedes editar o eliminar tus historias en cualquier
                    momento. Las eliminaciones son permanentes e irreversibles.
                  </p>
                  <p>
                    <strong>Gestión de compartidos:</strong> Controlas completamente con quién te conectas.
                    Puedes aceptar, rechazar o eliminar conexiones cuando quieras.
                  </p>
                  <p>
                    <strong>Perfil:</strong> Tu nombre y foto son visibles solo para usuarios con los que
                    tienes alguna interacción (compartidos o historias públicas).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Seguridad */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Eye className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Seguridad de Datos</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Utilizamos Supabase como proveedor de infraestructura, que implementa:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Cifrado de datos en tránsito (HTTPS/TLS)</li>
                    <li>Cifrado de datos en reposo</li>
                    <li>Row Level Security (RLS) para control de acceso granular</li>
                    <li>Autenticación segura con tokens JWT</li>
                    <li>Copias de seguridad automáticas</li>
                  </ul>
                  <p className="mt-3">
                    A pesar de estas medidas, ningún sistema es 100% seguro. Te recomendamos usar
                    contraseñas fuertes y únicas para tu cuenta.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Tus derechos */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <UserCheck className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Tus Derechos</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>Tienes derecho a:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>Acceso:</strong> Ver toda la información que tenemos sobre ti</li>
                    <li><strong>Rectificación:</strong> Corregir datos incorrectos en tu perfil</li>
                    <li><strong>Eliminación:</strong> Borrar tu cuenta y todos tus datos</li>
                    <li><strong>Portabilidad:</strong> Exportar tus historias en formato legible</li>
                    <li><strong>Oposición:</strong> Rechazar ciertos usos de tus datos</li>
                    <li><strong>Limitación:</strong> Restringir cómo procesamos tus datos</li>
                  </ul>
                  <p className="mt-4">
                    Para ejercer cualquiera de estos derechos, contáctanos en:{" "}
                    <a href="mailto:gomezmon@hotmail.com" className="text-primary hover:underline">
                      gomezmon@hotmail.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="bg-card border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-3">Cookies</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Usamos cookies esenciales para mantener tu sesión activa cuando inicias sesión.
                No usamos cookies de seguimiento, análisis o publicidad.
              </p>
              <p>
                Puedes configurar tu navegador para rechazar cookies, pero esto impedirá que
                puedas iniciar sesión en la plataforma.
              </p>
            </div>
          </section>

          {/* Cambios */}
          <section className="bg-card border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-3">Cambios a esta Política</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios
                significativos por email o mediante un aviso en la plataforma.
              </p>
              <p>
                La fecha de última actualización siempre estará visible en la parte superior
                de esta página.
              </p>
            </div>
          </section>

          {/* Contacto */}
          <section className="bg-gradient-to-r from-primary/10 to-accent/10 border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-3 text-center">¿Preguntas?</h2>
            <p className="text-center text-muted-foreground">
              Si tienes dudas sobre esta política de privacidad o cómo manejamos tus datos,
              contáctanos en:
            </p>
            <p className="text-center mt-3">
              <a href="mailto:gomezmon@hotmail.com" className="text-primary hover:underline font-semibold">
                gomezmon@hotmail.com
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
