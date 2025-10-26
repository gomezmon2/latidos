import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Book, Lock, Users, FileText, Share2, ChevronRight, CircleDot, MessageCircle, Palette, Search } from "lucide-react";
import { ROUTES } from "@/routes";

/**
 * What Is Latidos Section
 * Brief introduction to the platform with quick guide
 */
export const WhatIsLatidos = () => {
  return (
    <section className="py-16 px-6 bg-gradient-subtle">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ¿Qué es Latidos?
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Una plataforma donde compartir experiencias auténticas y conectar con personas a través de historias reales
          </p>
        </div>

        {/* Quick Guide Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Como empezar */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Book className="h-5 w-5 text-primary" />
                Cómo empezar
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>1. Crea tu cuenta</p>
              <p>2. Completa tu perfil</p>
              <p>3. Explora historias públicas</p>
              <p>4. Conecta con otros usuarios</p>
              <p>5. Comparte tus experiencias</p>
            </CardContent>
          </Card>

          {/* Card 2: Privacidad */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-5 w-5 text-primary" />
                Control de privacidad
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Públicas:</strong> Todos pueden ver</p>
              <p><strong>Privadas:</strong> Solo tus compartidos</p>
              <p><strong>Círculos:</strong> Grupos específicos</p>
              <p className="pt-2 text-xs">
                Tú decides quién ve cada historia
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Compartidos */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Sistema de compartidos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Conexiones bidireccionales entre usuarios</p>
              <p>Accede a historias privadas mutuas</p>
              <p>Envía y acepta solicitudes</p>
              <p className="pt-2 text-xs">
                Base para círculos y compartir
              </p>
            </CardContent>
          </Card>

          {/* Card 3b: Círculos */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CircleDot className="h-5 w-5 text-primary" />
                Círculos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Organiza compartidos en grupos</p>
              <p>Ej: Familia, Amigos, Trabajo</p>
              <p>Comparte historias con grupos específicos</p>
              <p className="pt-2 text-xs">
                Control granular de privacidad
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Escribir historias */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Escribir historias
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Título:</strong> Descriptivo y atractivo</p>
              <p><strong>Contenido:</strong> Auténtico y sincero</p>
              <p><strong>Imagen:</strong> Hasta 5MB</p>
              <p><strong>Etiquetas:</strong> Para categorizar</p>
            </CardContent>
          </Card>

          {/* Card 5: Interacciones */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="h-5 w-5 text-primary" />
                Interacciones
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Reacciones:</strong> Corazón a historias</p>
              <p><strong>Comentarios:</strong> Comparte pensamientos</p>
              <p><strong>Favoritos:</strong> Guarda para releer</p>
              <p className="pt-2 text-xs">
                Espacio seguro y respetuoso
              </p>
            </CardContent>
          </Card>

          {/* Card 6: Etiquetas */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Share2 className="h-5 w-5 text-primary" />
                Uso de etiquetas
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Categoriza tus historias</p>
              <p>Descubre contenido relacionado</p>
              <p>Crea etiquetas nuevas</p>
              <p>Filtra por temáticas</p>
            </CardContent>
          </Card>

          {/* Card 7: Chat/Mensajería */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5 text-primary" />
                Mensajería
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Chat en tiempo real:</strong> Conversa con tus compartidos</p>
              <p><strong>Privado:</strong> Solo entre conexiones aceptadas</p>
              <p><strong>Notificaciones:</strong> Contador de mensajes no leídos</p>
              <p className="pt-2 text-xs">
                Inicia conversaciones desde Compartidos
              </p>
            </CardContent>
          </Card>

          {/* Card 8: Búsqueda y filtros */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="h-5 w-5 text-primary" />
                Búsqueda avanzada
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Busca:</strong> Por título, contenido o autor</p>
              <p><strong>Filtra:</strong> Por etiquetas temáticas</p>
              <p><strong>Combina:</strong> Búsqueda y filtros simultáneos</p>
              <p className="pt-2 text-xs">
                Resultados en tiempo real
              </p>
            </CardContent>
          </Card>

          {/* Card 9: Personalización */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5 text-primary" />
                Personalización
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Modo oscuro:</strong> Tres opciones disponibles</p>
              <p><strong>Iconos personalizados:</strong> Interfaz intuitiva</p>
              <p><strong>Navegación rápida:</strong> Botones flotantes</p>
              <p className="pt-2 text-xs">
                Optimizado para móvil y escritorio
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA to full guide */}
        <div className="text-center">
          <Link to={ROUTES.GUIDES}>
            <Button variant="outline" className="gap-2">
              Ver guía completa
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
