import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/sections";
import { Target, Heart, Shield, Users, Sparkles, BookOpen } from "lucide-react";

/**
 * Mission Page
 * About our mission and values
 */
const Mission = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-4xl px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Nuestra Misión
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Crear un espacio digital donde las experiencias humanas auténticas
            prevalezcan sobre la superficialidad de las redes sociales
          </p>
        </div>

        <div className="space-y-8">
          {/* Proposito */}
          <section className="bg-card border rounded-lg p-8">
            <div className="flex items-start gap-4">
              <Target className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-4">Nuestro Propósito</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Momentos Auténticos nace de la necesidad de recuperar la conexión humana genuina
                    en un mundo digital saturado de contenido superficial y efímero.
                  </p>
                  <p>
                    Creemos que cada persona tiene experiencias valiosas que contar, momentos que
                    merecen ser preservados y compartidos con aquellos que realmente importan.
                  </p>
                  <p>
                    No buscamos likes, ni viralidad, ni algoritmos que dicten qué es importante.
                    Buscamos crear un espacio seguro para la vulnerabilidad, la reflexión y la
                    conexión real entre personas.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Valores */}
          <section className="bg-card border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <Sparkles className="h-7 w-7 text-primary" />
              Nuestros Valores
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Autenticidad</h3>
                    <p className="text-sm text-muted-foreground">
                      Valoramos las historias reales, sin filtros ni pretensiones.
                      Cada experiencia importa, sin importar cuán ordinaria parezca.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Privacidad</h3>
                    <p className="text-sm text-muted-foreground">
                      Tu decides quién puede leer tus historias. Control total sobre
                      tu contenido y con quién lo compartes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Comunidad</h3>
                    <p className="text-sm text-muted-foreground">
                      Fomentamos conexiones significativas basadas en experiencias
                      compartidas y empatía genuina.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Preservación</h3>
                    <p className="text-sm text-muted-foreground">
                      Tus recuerdos y experiencias merecen ser guardados, no perdidos
                      en el flujo interminable de contenido.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Lo que no somos */}
          <section className="bg-card border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Lo que NO somos</h2>
            <div className="space-y-3 text-muted-foreground">
              <p className="flex items-start gap-2">
                <span className="text-red-500 font-bold">×</span>
                <span>No somos una red social convencional que busca maximizar tu tiempo en pantalla</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-red-500 font-bold">×</span>
                <span>No usamos algoritmos que decidan qué ver o prioricen contenido viral</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-red-500 font-bold">×</span>
                <span>No vendemos tus datos ni mostramos publicidad invasiva</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-red-500 font-bold">×</span>
                <span>No fomentamos la competencia por likes, seguidores o métricas de vanidad</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-red-500 font-bold">×</span>
                <span>No permitimos contenido superficial, spam o autopromoción excesiva</span>
              </p>
            </div>
          </section>

          {/* Lo que buscamos */}
          <section className="bg-card border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Lo que SÍ buscamos</h2>
            <div className="space-y-3 text-muted-foreground">
              <p className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Crear un diario digital compartido donde preservar tus momentos importantes</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Fomentar la escritura reflexiva y la expresión emocional genuina</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Conectar a personas a través de experiencias compartidas, no métricas</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Ofrecer un espacio seguro para la vulnerabilidad y la autenticidad</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Respetar tu tiempo, tu privacidad y tu bienestar digital</span>
              </p>
            </div>
          </section>

          {/* Compromiso */}
          <section className="bg-gradient-to-r from-primary/10 to-accent/10 border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-center">Nuestro Compromiso</h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto">
              Nos comprometemos a mantener Momentos Auténticos como un espacio libre de
              toxicidad, donde cada historia sea respetada y cada persona se sienta segura
              para compartir sus experiencias más personales.
            </p>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-4">
              Este es un proyecto hecho con ❤️ para personas reales que valoran las
              conexiones genuinas sobre las métricas superficiales.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Mission;
